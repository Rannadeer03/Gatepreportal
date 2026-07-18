-- Security hardening migration — closes the privilege-escalation chain and
-- related issues found in a full repo audit dated 2026-07-18. Written to be
-- idempotent (safe to re-run) since it wasn't possible to test directly
-- against the live project from this session; review before applying to
-- production, then run `supabase db push` (or apply via the dashboard SQL
-- editor) against project ref matching VITE_SUPABASE_URL.
--
-- Fixes, in order:
--   1. Drop the unused plaintext temp_password column.
--   2. Add is_staff() helper (SECURITY DEFINER, STABLE) to avoid the
--      recursive-RLS trap seen 3x in prior migrations.
--   3. Rebuild `profiles` RLS from a clean slate: self-access + staff-read,
--      self-registration locked to role='student', and a trigger that hard-
--      blocks any non-staff user from changing their own role/approval
--      fields via a normal UPDATE.
--   4. Fix approve_user() to require p_approved_by = auth.uid() (closes the
--      self-approval bypass).
--   5. Lock down notifications / academic_questions / questions RLS.
--   6. Fix the avatars bucket's invalid USING-on-INSERT policy.
--   7. Revoke GRANT ALL -> GRANT SELECT, INSERT on system_logs / teacher_requests.
--   8. Change teacher-deletion cascades from CASCADE to SET NULL so removing
--      a teacher doesn't wipe every student's grades/submissions.
--   9. Make submission-bearing storage buckets non-public.
--  10. Add the missing student-facing SELECT policy on academic_tests.
--  11. Re-apply SECURITY DEFINER SET search_path on prevent_multiple_test_attempts().
--  12. Remove the leaked default-super-admin credential from table metadata.

-- ============================================================
-- 1. Drop unused plaintext temp_password column
-- ============================================================
-- Confirmed via `grep -rn temp_password src` that no live code path reads
-- or writes this column (only a stale type declaration referenced it).
ALTER TABLE profiles DROP COLUMN IF EXISTS temp_password;

-- ============================================================
-- 2. is_staff() helper — avoids querying profiles from within a profiles
--    policy (the exact pattern that caused "infinite recursion detected in
--    policy for relation 'profiles'" on three separate prior occasions).
-- ============================================================
CREATE OR REPLACE FUNCTION is_staff(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = check_user_id
    AND role IN ('teacher', 'admin', 'super_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION is_staff(UUID) TO authenticated;

-- ============================================================
-- 3. Rebuild profiles RLS from a clean slate
-- ============================================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop every policy name this table has ever had across its migration
-- history (see supabase/migrations/2025* for the trail) so nothing
-- overlapping survives.
DROP POLICY IF EXISTS "Allow profile insertion during registration" ON profiles;
DROP POLICY IF EXISTS "Allow profile reading for role checks" ON profiles;
DROP POLICY IF EXISTS "Allow profile-only registration" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles." ON profiles;
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can read pending profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view other profiles for role lookup" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow role lookup" ON profiles;
DROP POLICY IF EXISTS "Allow registration" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated read" ON profiles;
DROP POLICY IF EXISTS "Allow own insert" ON profiles;
DROP POLICY IF EXISTS "Allow own update" ON profiles;
DROP POLICY IF EXISTS "Allow all inserts" ON profiles;
DROP POLICY IF EXISTS "Teachers can view all profiles" ON profiles;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: a user can always read their own row; staff can read every row
-- (dashboards, grading, and admin tooling all depend on this).
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_staff(auth.uid()));

-- INSERT: self-registration only, and only as a plain student. Teacher/
-- admin/super_admin accounts are created by the admin-actions edge
-- function using the service-role key, which bypasses RLS entirely, so
-- this restriction never blocks that legitimate path.
CREATE POLICY "profiles_insert_self_as_student"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'student');

-- UPDATE: self or staff. Column-level protection against a student
-- escalating their own role/approval fields is enforced by the trigger
-- below, not by this policy (Postgres RLS can't do column-level checks on
-- its own).
CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_staff(auth.uid()))
  WITH CHECK (auth.uid() = id OR is_staff(auth.uid()));

-- Defense in depth: even if a future policy change re-opens self-UPDATE
-- too far, a non-staff user editing their own row can never change role,
-- approval_status, approved_by, or approved_at.
CREATE OR REPLACE FUNCTION prevent_profile_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.id AND NOT is_staff(auth.uid()) THEN
    NEW.role := OLD.role;
    NEW.approval_status := OLD.approval_status;
    NEW.approved_by := OLD.approved_by;
    NEW.approved_at := OLD.approved_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_profile_self_escalation ON profiles;
CREATE TRIGGER trigger_prevent_profile_self_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_profile_self_escalation();

-- ============================================================
-- 4. Fix approve_user(): require the caller to actually BE the approver
--    they claim to be, instead of trusting a client-supplied UUID.
-- ============================================================
CREATE OR REPLACE FUNCTION approve_user(
  p_user_id UUID,
  p_approved_by UUID,
  p_approval_status TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- The approver must be the authenticated caller, not merely someone the
  -- caller claims to be.
  IF p_approved_by IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'p_approved_by must match the authenticated caller';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_approved_by AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admin can approve users';
  END IF;

  UPDATE profiles
  SET
    approval_status = p_approval_status,
    approved_by = p_approved_by,
    approved_at = CASE WHEN p_approval_status = 'approved' THEN NOW() ELSE NULL END,
    rejection_reason = p_rejection_reason
  WHERE id = p_user_id;

  PERFORM log_user_activity(
    p_user_id,
    CASE WHEN p_approval_status = 'approved' THEN 'user_approved' ELSE 'user_rejected' END,
    jsonb_build_object(
      'approved_by', p_approved_by,
      'rejection_reason', p_rejection_reason
    )
  );

  RETURN TRUE;
END;
$$;

-- ============================================================
-- 5. Lock down notifications / academic_questions / questions RLS
-- ============================================================

-- notifications: only staff (or the service role, which bypasses RLS
-- entirely) may create notifications — previously WITH CHECK (true) with
-- no TO clause let literally anyone, including anon, insert arbitrary rows
-- (e.g. phishing content) into every user's notification feed.
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "Staff can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (is_staff(auth.uid()));

-- academic_questions: restrict read to authenticated users (previously
-- USING (true) with no TO clause exposed the full question bank, including
-- correct_option, to anonymous/unauthenticated clients).
DROP POLICY IF EXISTS "All users can view academic questions" ON academic_questions;
CREATE POLICY "Authenticated users can view academic questions"
  ON academic_questions FOR SELECT
  TO authenticated
  USING (true);

-- academic_questions: only teachers/staff may write questions (previously
-- any authenticated user, including students, could insert/pollute the
-- question bank).
DROP POLICY IF EXISTS "Authenticated can insert academic questions" ON academic_questions;
CREATE POLICY "Staff can insert academic questions"
  ON academic_questions FOR INSERT
  TO authenticated
  WITH CHECK (is_staff(auth.uid()));

-- questions (mock-test bank): same anonymous-read problem as above.
DROP POLICY IF EXISTS "Students and Public can view questions in active tests" ON questions;
CREATE POLICY "Authenticated users can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 6. Fix avatars bucket: Postgres only accepts WITH CHECK (not USING) on a
--    FOR INSERT policy — the original migration likely never applied.
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can upload to avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload to avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- ============================================================
-- 7. Revoke GRANT ALL (which includes TRUNCATE, ungated by RLS) down to
--    what the app actually needs.
-- ============================================================
REVOKE ALL ON system_logs FROM authenticated;
GRANT SELECT, INSERT ON system_logs TO authenticated;

REVOKE ALL ON teacher_requests FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON teacher_requests TO authenticated;

-- ============================================================
-- 8. Teacher-deletion cascades: SET NULL instead of CASCADE, so removing a
--    teacher account doesn't silently delete every student's grades,
--    submissions, and course materials tied to that teacher.
-- ============================================================
DO $$
DECLARE
  fk_name text;
BEGIN
  -- subjects.teacher_id -> profiles(id)
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'subjects' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'teacher_id'
  LIMIT 1;
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE subjects DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE subjects ADD CONSTRAINT subjects_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE SET NULL;

  -- tests.teacher_id -> auth.users(id)
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'tests' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'teacher_id'
  LIMIT 1;
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE tests DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE tests ALTER COLUMN teacher_id DROP NOT NULL;
  ALTER TABLE tests ADD CONSTRAINT tests_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE SET NULL;

  -- academic_tests.teacher_id -> auth.users(id)
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'academic_tests' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'teacher_id'
  LIMIT 1;
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE academic_tests DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE academic_tests ALTER COLUMN teacher_id DROP NOT NULL;
  ALTER TABLE academic_tests ADD CONSTRAINT academic_tests_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE SET NULL;
END $$;

-- ============================================================
-- 9. Submission-bearing buckets must not be public: a public bucket serves
--    objects via the unauthenticated /object/public/... path regardless of
--    storage.objects RLS, so folder-prefix policies on these buckets were
--    not actually protecting anything.
-- ============================================================
UPDATE storage.buckets SET public = false WHERE id IN ('student-assignments', 'academic_assignment_submissions');

-- ============================================================
-- 10. academic_tests never got a student-facing SELECT policy (unlike the
--     mock-test `tests` table) — students could not read active academic
--     tests through RLS at all.
-- ============================================================
DROP POLICY IF EXISTS "Students can view available academic tests" ON academic_tests;
CREATE POLICY "Students can view available academic tests"
  ON academic_tests FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    (
      is_scheduled = false OR
      (
        is_scheduled = true AND
        (
          (access_window_start IS NULL AND access_window_end IS NULL) OR
          (NOW() >= COALESCE(access_window_start, NOW()) AND NOW() <= COALESCE(access_window_end, NOW()))
        )
      )
    ) AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'student')
  );

-- ============================================================
-- 11. Re-apply the search_path hardening that prevent_multiple_test_attempts()
--     lost when it was recreated in 20250610110000 (same function, no
--     behavior change — just closes the mutable-search-path lint warning).
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_multiple_test_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM test_results
    WHERE test_id = NEW.test_id
    AND student_id = NEW.student_id
    AND status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Student has already completed this test';
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 12. Remove the leaked default-super-admin credential from table
--     metadata. Rotate the actual password separately via the Supabase
--     dashboard / admin-actions — this only clears the comment.
-- ============================================================
COMMENT ON TABLE profiles IS NULL;

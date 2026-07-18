-- Security hardening migration — closes the privilege-escalation chain and
-- related issues found in a full repo audit dated 2026-07-18, REWRITTEN
-- after direct inspection of the live project (upgzorwatmvvuemxceyx), whose
-- actual schema/policies diverged substantially from the local migrations
-- folder (this project's live migration history has only 4 entries — it
-- was clearly built via direct SQL/dashboard edits, not by replaying the
-- files in supabase/migrations). Every statement below was checked against
-- live pg_policies / pg_proc / information_schema before being written, not
-- assumed from the local file history.
--
-- Live-only findings discovered during that inspection, worse than the
-- original static-file audit:
--   * approve_user(uuid, text, text) — a SECOND overload of approve_user
--     with NO approver/authorization check whatsoever, and EXECUTE granted
--     to `anon`. Any signed-up user (students self-approve on registration,
--     so this requires zero prior approval) could call it directly and
--     approve/reject ANY account.
--   * profiles INSERT policy "Allow all authenticated users to insert
--     profiles" had no id-ownership check at all (WITH CHECK
--     auth.role()='authenticated' only) — any authenticated user could
--     insert a profiles row for ANY id/role, not just their own.
--   * profiles UPDATE policy "Allow users to update own profile" allows a
--     user to update every column of their own row, including role,
--     approval_status, approved_by — a direct one-query self-escalation
--     path independent of the approve_user() issue above.
--
-- Idempotent (safe to re-run).

-- ============================================================
-- 1. Drop unused plaintext temp_password column (confirmed present on
--    live profiles, confirmed unreferenced by any current app code).
-- ============================================================
ALTER TABLE profiles DROP COLUMN IF EXISTS temp_password;

-- ============================================================
-- 2. is_staff() helper — avoids querying profiles from within a profiles
--    policy (the exact pattern that caused prior "infinite recursion
--    detected in policy for relation 'profiles'" incidents per migration
--    history).
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
-- 3. Rebuild profiles RLS from a clean slate. Drops both the live policy
--    names (verified via pg_policies) and every name this table has ever
--    had across the local migration history, so nothing overlapping
--    survives regardless of which set actually matches this project.
-- ============================================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Live-verified names (2026-07-19 inspection of upgzorwatmvvuemxceyx)
DROP POLICY IF EXISTS "Allow all authenticated users to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all authenticated users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access to profiles" ON profiles;

-- Full historical name list from the local supabase/migrations trail, kept
-- as defense in depth in case any of these exist on top of the above.
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

-- INSERT: self-registration only, and only as a plain student, and only
-- for the caller's own id. Teacher/admin/super_admin accounts are created
-- by the admin-actions edge function using the service-role key, which
-- bypasses RLS entirely, so this restriction never blocks that path.
CREATE POLICY "profiles_insert_self_as_student"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'student');

-- Service role (edge functions) always has full access.
CREATE POLICY "profiles_service_role_all"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- UPDATE: self or staff. Column-level protection against a student
-- escalating their own role/approval fields is enforced by the trigger
-- below, not by this policy (Postgres RLS can't do column-level checks on
-- its own) — this is what closes the "update own profile.role" bug found
-- live.
CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_staff(auth.uid()))
  WITH CHECK (auth.uid() = id OR is_staff(auth.uid()));

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
-- 4. approve_user(): the live project has TWO overloads.
--    a) approve_user(uuid, text, text) — no authorization check at all,
--       and EXECUTE was granted to `anon`. Drop it outright; nothing in
--       the current app calls this 3-argument form.
--    b) approve_user(uuid, uuid, text, text) — trusted a client-supplied
--       p_approved_by instead of the caller's real identity. Fixed to
--       require p_approved_by = auth.uid().
-- ============================================================
DROP FUNCTION IF EXISTS public.approve_user(uuid, text, text);

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

REVOKE EXECUTE ON FUNCTION approve_user(uuid, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION approve_user(uuid, uuid, text, text) TO authenticated;

-- ============================================================
-- 5. notifications: only staff (or the service role, which bypasses RLS
--    entirely) may create notifications — previously WITH CHECK (true)
--    with no TO clause let literally anyone, including anon, insert
--    arbitrary rows (e.g. phishing content) into every user's
--    notification feed.
-- ============================================================
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "Staff can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (is_staff(auth.uid()));

-- ============================================================
-- 6. academic_questions: restrict read to authenticated users (previously
--    USING (true) with no TO clause exposed the full question bank,
--    including correct_option, to anonymous/unauthenticated clients), and
--    restrict writes to staff (previously any authenticated user,
--    including students, could insert/pollute the question bank).
--    NOTE: the plain `questions` table (mock-test bank) was checked live
--    and already has correctly-scoped, auth-gated policies — better than
--    what the local migration files suggested — so it is intentionally
--    left untouched here.
-- ============================================================
DROP POLICY IF EXISTS "All users can view academic questions" ON academic_questions;
CREATE POLICY "Authenticated users can view academic questions"
  ON academic_questions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated can insert academic questions" ON academic_questions;
CREATE POLICY "Staff can insert academic questions"
  ON academic_questions FOR INSERT
  TO authenticated
  WITH CHECK (is_staff(auth.uid()));

-- ============================================================
-- 7. academic_tests: the live SELECT policy ("All users can view active
--    academic tests") had no auth/role check at all (USING (is_active =
--    true) on the `public` role, so even anon could read test metadata).
--    Replace with an authenticated + student/staff-scoped version mirroring
--    the mock-test `tests` table's window-aware policy. Teacher-owned-row
--    policies were already correct and are left as-is.
-- ============================================================
DROP POLICY IF EXISTS "All users can view active academic tests" ON academic_tests;
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
    (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'student')
      OR is_staff(auth.uid())
    )
  );

-- ============================================================
-- 8. avatars bucket: re-apply the correct WITH CHECK form (already correct
--    on live, kept for idempotency/defense in depth in case this migration
--    runs against an environment where it wasn't).
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can upload to avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload to avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- ============================================================
-- 9. system_logs / teacher_requests: `authenticated` had been granted
--    ALL (including TRUNCATE and DELETE, neither gated by RLS in any
--    meaningful way) at the table-grant level. Revoke down to what the
--    app actually needs. Also drop the two blanket RLS policies on
--    system_logs that let any authenticated user read the ENTIRE audit
--    log (every user's login attempts, approvals, etc.) and insert log
--    rows with an arbitrary user_id — the self-scoped and super-admin
--    policies already present are sufficient and are left as-is.
-- ============================================================
REVOKE ALL ON system_logs FROM authenticated;
GRANT SELECT, INSERT ON system_logs TO authenticated;

DROP POLICY IF EXISTS "Allow all authenticated users to read logs" ON system_logs;
DROP POLICY IF EXISTS "Allow all authenticated users to insert logs" ON system_logs;

REVOKE ALL ON teacher_requests FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON teacher_requests TO authenticated;

-- ============================================================
-- 10. Teacher-deletion cascade: live inspection found only one real
--     cascade risk — tests.teacher_id -> profiles(id) ON DELETE CASCADE
--     (subjects.teacher_id and academic_tests.teacher_id have no FK
--     constraint at all on this live project, so no cascade risk exists
--     there to fix). Change to SET NULL so removing a teacher doesn't
--     delete their tests (and everything that cascades from tests:
--     test_questions, test_results/grades).
-- ============================================================
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'tests' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'teacher_id'
  LIMIT 1;
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE tests DROP CONSTRAINT %I', fk_name);
  END IF;
  ALTER TABLE tests ADD CONSTRAINT tests_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE SET NULL;
END $$;

-- ============================================================
-- 11. Submission-bearing buckets must not be public: a public bucket
--     serves objects via the unauthenticated /object/public/... path
--     regardless of storage.objects RLS, so folder-prefix policies on
--     these buckets were not actually protecting anything. Scoped only to
--     the two buckets that hold private student submissions — other
--     public buckets (course materials, PYQ files, avatars, etc.) are
--     intentionally public resources and were left untouched.
-- ============================================================
UPDATE storage.buckets SET public = false WHERE id IN ('student-assignments', 'academic_assignment_submissions');

-- ============================================================
-- 12. Remove the leaked default-super-admin credential from table
--     metadata, if present. Rotate the actual password separately (see
--     the mission report) — this only clears the comment.
-- ============================================================
COMMENT ON TABLE profiles IS NULL;

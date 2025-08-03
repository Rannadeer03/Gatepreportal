-- Enable RLS on tables that have policies
-- This migration addresses the "policy_exists_rls_disabled" and "rls_disabled_in_public" linter warnings

-- Enable RLS on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables that have policies
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pyq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled on key tables
DO $$
BEGIN
  -- Check profiles table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'Failed to enable RLS on profiles table';
  END IF;

  -- Check other critical tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'questions' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'Failed to enable RLS on questions table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'assignments' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'Failed to enable RLS on assignments table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'assignment_submissions' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'Failed to enable RLS on assignment_submissions table';
  END IF;

  RAISE NOTICE 'RLS successfully enabled on all tables with policies';
END $$; 
-- Final fix for profiles table RLS policies
-- This migration completely removes all policies and creates only essential ones

-- Disable RLS completely first
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL possible policies (comprehensive cleanup)
DROP POLICY IF EXISTS "Allow profile insertion during registration" ON profiles;
DROP POLICY IF EXISTS "Allow profile reading for role checks" ON profiles;
DROP POLICY IF EXISTS "Allow profile-only registration" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles." ON profiles;
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can read pending profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view other profiles for role lookup" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow role lookup" ON profiles;
DROP POLICY IF EXISTS "Allow registration" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create ONLY the essential policies (minimal set)
-- Policy 1: Allow all authenticated users to read profiles (for role checks)
CREATE POLICY "Allow authenticated read"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 2: Allow users to insert their own profile
CREATE POLICY "Allow own insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Allow own update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow all inserts (for registration)
CREATE POLICY "Allow all inserts"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Verify the setup
DO $$
BEGIN
  -- Check RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on profiles table';
  END IF;

  -- Count policies
  DECLARE
    policy_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles';
    
    RAISE NOTICE 'Profiles table has % policies', policy_count;
    
    IF policy_count = 0 THEN
      RAISE EXCEPTION 'No policies found on profiles table';
    END IF;
  END;

  RAISE NOTICE 'Profiles table RLS policies fixed successfully';
END $$; 
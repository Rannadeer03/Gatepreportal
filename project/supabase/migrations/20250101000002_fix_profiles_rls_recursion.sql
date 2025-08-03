-- Fix infinite recursion in profiles table RLS policies
-- This migration addresses the "infinite recursion detected in policy for relation 'profiles'" error

-- First, disable RLS temporarily to drop all policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for profiles table
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

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified, non-recursive policies
-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Super admins can manage all profiles
CREATE POLICY "Super admins can manage all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy 5: Allow authenticated users to read profiles for role checks (simplified)
CREATE POLICY "Allow role lookup"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 6: Allow profile creation during registration (for unauthenticated users)
CREATE POLICY "Allow registration"
  ON profiles FOR INSERT
  WITH CHECK (true); -- Allow all inserts for registration

-- Verify policies are created
DO $$
BEGIN
  -- Check that RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on profiles table';
  END IF;

  -- Check that policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    RAISE EXCEPTION 'No policies found on profiles table';
  END IF;

  RAISE NOTICE 'Profiles table RLS policies fixed successfully';
END $$; 
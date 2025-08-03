-- Add temp_password column for profile-only registrations
-- This allows storing password temporarily until admin creates auth account

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS temp_password TEXT;

-- Add comment to document the field
COMMENT ON COLUMN profiles.temp_password IS 'Temporary password storage for pending registrations (cleared when auth account is created)';

-- Update RLS policies to allow profile-only registration
-- Drop existing policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow profile-only registration" ON profiles;
DROP POLICY IF EXISTS "Super admins can read pending profiles" ON profiles;

-- Create policy to allow anonymous profile-only registration
CREATE POLICY "Allow profile-only registration"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (
    auth_provider = 'pending' AND 
    approval_status = 'pending' AND
    role = 'student'
  );

-- Allow reading pending profiles for admin approval
CREATE POLICY "Super admins can read pending profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    ) OR
    auth.uid() = id
  );
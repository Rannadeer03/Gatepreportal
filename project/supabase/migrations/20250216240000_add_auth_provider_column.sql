-- Add auth_provider column to profiles table
-- This column indicates how the user was authenticated (email, pending, etc.)

-- Add the auth_provider column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

-- Add a check constraint to limit allowed values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_auth_provider_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_auth_provider_check 
  CHECK (auth_provider IN ('email', 'pending', 'google', 'github'));

-- Add comment to document the field
COMMENT ON COLUMN profiles.auth_provider IS 'Authentication provider: email, pending, google, github';

-- Update existing profiles to have 'email' as default auth_provider
UPDATE profiles SET auth_provider = 'email' WHERE auth_provider IS NULL; 
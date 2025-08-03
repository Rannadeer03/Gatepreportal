-- Simple Super Admin Creation
-- This creates a super admin account that can definitely log in

-- First, delete any existing super admin to avoid conflicts
DELETE FROM profiles WHERE email = 'superadmin@gatepreportal.com';
DELETE FROM auth.users WHERE email = 'superadmin@gatepreportal.com';

-- Create the auth user with minimal required fields
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid,
  'superadmin@gatepreportal.com',
  crypt('SuperAdmin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- Create the profile using the same ID
INSERT INTO profiles (
  id,
  name,
  email,
  role,
  approval_status,
  approved_at,
  approved_by,
  auth_provider,
  requires_password_change,
  department,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'superadmin@gatepreportal.com'),
  'Super Administrator',
  'superadmin@gatepreportal.com',
  'super_admin',
  'approved',
  NOW(),
  (SELECT id FROM auth.users WHERE email = 'superadmin@gatepreportal.com'),
  'email',
  false, -- Don't force password change for easier testing
  'Administration',
  NOW()
);

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Super Admin Account Created Successfully!';
  RAISE NOTICE '📧 Email: superadmin@gatepreportal.com';
  RAISE NOTICE '🔑 Password: SuperAdmin123!';
  RAISE NOTICE '🚀 You can now log in and access the super admin dashboard';
END $$;
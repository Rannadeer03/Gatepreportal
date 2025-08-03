-- Create Default Super Admin Account
-- This migration creates a default super admin account for initial setup

-- First, check if the super admin already exists and skip if it does
DO $$
BEGIN
  -- Only proceed if the super admin doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'superadmin@gatepreportal.com') THEN
    
    -- Insert default super admin user into auth.users
    -- Note: This uses a default password that should be changed immediately after first login
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
      '00000000-0000-0000-0000-000000000001'::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'superadmin@gatepreportal.com',
      crypt('SuperAdmin123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );

    -- Create corresponding profile for the super admin
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
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Super Administrator',
      'superadmin@gatepreportal.com',
      'super_admin',
      'approved',
      NOW(),
      '00000000-0000-0000-0000-000000000001'::uuid, -- Self-approved
      'email',
      true, -- Force password change on first login
      'Administration',
      NOW(),
      NOW()
    );

    -- Log the super admin creation
    INSERT INTO system_logs (
      user_id,
      action_type,
      action_details,
      created_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'super_admin_created',
      '{"method": "migration", "default_account": true, "requires_password_change": true}'::jsonb,
      NOW()
    );

    RAISE NOTICE 'Default super admin account created successfully';
    RAISE NOTICE 'Email: superadmin@gatepreportal.com';
    RAISE NOTICE 'Password: SuperAdmin123!';
    RAISE NOTICE 'IMPORTANT: Change this password immediately after first login!';
    
  ELSE
    RAISE NOTICE 'Super admin account already exists, skipping creation';
  END IF;
END $$;

-- Create a comment for documentation
COMMENT ON TABLE profiles IS 'Default super admin: superadmin@gatepreportal.com / SuperAdmin123! (change immediately)';
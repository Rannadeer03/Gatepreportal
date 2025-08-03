-- Bulletproof Super Admin Creation
-- This script adapts to whatever auth.users schema exists

-- Clean up existing super admin
DELETE FROM profiles WHERE email = 'superadmin@gatepreportal.com';
DELETE FROM auth.users WHERE email = 'superadmin@gatepreportal.com';

-- Create super admin with dynamic column detection
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
    has_instance_id boolean;
    has_aud boolean;
    has_role boolean;
BEGIN
    -- Check what columns exist in auth.users
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'instance_id'
    ) INTO has_instance_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'aud'
    ) INTO has_aud;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'role'
    ) INTO has_role;

    -- Build and execute dynamic INSERT based on available columns
    IF has_instance_id AND has_aud AND has_role THEN
        -- Full schema
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
        VALUES (user_id, '00000000-0000-0000-0000-000000000000'::uuid, 'superadmin@gatepreportal.com', 
                crypt('SuperAdmin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
    ELSIF has_aud AND has_role THEN
        -- No instance_id
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
        VALUES (user_id, 'superadmin@gatepreportal.com', 
                crypt('SuperAdmin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
    ELSE
        -- Minimal schema
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (user_id, 'superadmin@gatepreportal.com', 
                crypt('SuperAdmin123!', gen_salt('bf')), NOW(), NOW(), NOW());
    END IF;

    -- Create profile (this should be consistent)
    INSERT INTO profiles (
        id, name, email, role, approval_status, approved_at, approved_by, auth_provider, created_at
    ) VALUES (
        user_id, 'Super Administrator', 'superadmin@gatepreportal.com', 'super_admin', 
        'approved', NOW(), user_id, 'email', NOW()
    );

    RAISE NOTICE '✅ Super Admin Account Created!';
    RAISE NOTICE '📧 Email: superadmin@gatepreportal.com';
    RAISE NOTICE '🔑 Password: SuperAdmin123!';
    RAISE NOTICE '🎯 User ID: %', user_id;
    
END $$;
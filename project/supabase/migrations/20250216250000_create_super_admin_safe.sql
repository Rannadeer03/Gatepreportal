-- Safe Super Admin Creation
-- This script handles foreign key constraints properly

-- First, check if super admin already exists
DO $$
DECLARE
    existing_user_id uuid;
    user_id uuid := gen_random_uuid();
    has_instance_id boolean;
    has_aud boolean;
    has_role boolean;
BEGIN
    -- Check if super admin already exists
    SELECT id INTO existing_user_id 
    FROM profiles 
    WHERE email = 'superadmin@gatepreportal.com';
    
    IF existing_user_id IS NOT NULL THEN
        RAISE NOTICE '✅ Super Admin already exists with ID: %', existing_user_id;
        RETURN;
    END IF;

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

    -- Create auth user with dynamic column detection
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
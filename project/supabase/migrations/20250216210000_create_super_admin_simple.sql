-- Simple Super Admin Creation - Compatible with all Supabase versions
-- This creates a super admin account with minimal fields

-- Clean up any existing super admin
DELETE FROM profiles WHERE email = 'superadmin@gatepreportal.com';
DELETE FROM auth.users WHERE email = 'superadmin@gatepreportal.com';

-- Insert into auth.users with only essential fields
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    -- Insert auth user
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'superadmin@gatepreportal.com',
        crypt('SuperAdmin123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW()
    );

    -- Insert profile
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
        created_at
    ) VALUES (
        user_id,
        'Super Administrator',
        'superadmin@gatepreportal.com',
        'super_admin',
        'approved',
        NOW(),
        user_id,
        'email',
        false,
        NOW()
    );

    RAISE NOTICE '✅ Super Admin Created Successfully!';
    RAISE NOTICE '📧 Email: superadmin@gatepreportal.com';
    RAISE NOTICE '🔑 Password: SuperAdmin123!';
    
END $$;
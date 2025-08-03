# Super Admin Account Setup Guide

This guide provides step-by-step instructions for creating your first super admin account and setting up the super admin portal.

## 🔑 **DEFAULT SUPER ADMIN CREDENTIALS**

**Email:** `superadmin@gatepreportal.com`
**Password:** `SuperAdmin123!`

⚠️ **IMPORTANT**: Change this password immediately after first login for security!

## 🚀 Quick Setup (Recommended)

### Step 1: Apply Database Migrations
Apply both migration files to your Supabase project:

```sql
-- Run these in your Supabase SQL Editor in order:
-- 1. Main super admin system
-- File: project/supabase/migrations/20250802000000_create_super_admin_system.sql

-- 2. Default super admin account
-- File: project/supabase/migrations/20250802000001_create_default_super_admin.sql
```

### Step 2: Login with Default Credentials
1. **Go to Login Page**: Navigate to `/login`
2. **Enter Credentials**:
   - Email: `superadmin@gatepreportal.com`
   - Password: `SuperAdmin123!`
3. **Login**: Click login button

### Step 3: Access Super Admin Portal
1. **Automatic Redirect**: You'll be redirected to `/super-admin-dashboard`
2. **Change Password**: Go to Settings and change the default password immediately
3. **Start Managing**: Begin approving users and managing the system

## 🔄 Alternative Setup Methods

### Method A: Create Custom Super Admin Account

#### Option 1: Register and Upgrade
1. **Register a new account** through the normal registration process:
   - Go to `/register`
   - Fill out the form as a student (this is temporary)
   - Complete the registration

2. **Upgrade to Super Admin** via Supabase Dashboard:
   - Go to your Supabase project dashboard
   - Navigate to **Table Editor** → **profiles**
   - Find your newly created account
   - Edit the row and change:
     - `role` from `'student'` to `'super_admin'`
     - `approval_status` from `'pending'` to `'approved'`
   - Save the changes

#### Option 2: Upgrade Existing Account
If you already have an account in the system:

```sql
-- Run this in Supabase SQL Editor
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles
SET
  role = 'super_admin',
  approval_status = 'approved',
  approved_at = NOW()
WHERE email = 'your-email@example.com';
```

### Method B: Using Supabase Dashboard (GUI)

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Sign in to your project

2. **Navigate to Table Editor**
   - Click on "Table Editor" in the left sidebar
   - Select the "profiles" table

3. **Find Your Account**
   - Look for your email in the profiles table
   - Click on the row to edit it

4. **Update Role and Status**
   - Change `role` to: `super_admin`
   - Change `approval_status` to: `approved`
   - Set `approved_at` to current timestamp
   - Click "Save"

### Method C: Using SQL Commands

```sql
-- Method 2A: Create completely new super admin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@yourcompany.com',
  crypt('your-secure-password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Then create the profile
INSERT INTO profiles (
  id,
  name,
  email,
  role,
  approval_status,
  approved_at,
  auth_provider
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@yourcompany.com'),
  'Super Administrator',
  'admin@yourcompany.com',
  'super_admin',
  'approved',
  NOW(),
  'email'
);
```

```sql
-- Method 2B: Upgrade existing user
UPDATE profiles 
SET 
  role = 'super_admin',
  approval_status = 'approved',
  approved_at = NOW(),
  approved_by = id  -- Self-approved for initial setup
WHERE email = 'your-existing-email@example.com';
```

### Method D: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Connect to your project
supabase login
supabase link --project-ref your-project-ref

# Run SQL command
supabase db reset
# Then apply the migration and run the SQL commands above
```

## 🔐 Security Best Practices

### 1. Secure Password
- Use a strong, unique password for the super admin account
- Consider using a password manager
- Enable 2FA if available in your auth system

### 2. Limited Access
- Only create super admin accounts for trusted administrators
- Regularly review super admin access
- Use principle of least privilege

### 3. Activity Monitoring
- Regularly check the activity logs
- Monitor for suspicious super admin activities
- Set up alerts for critical actions

## ✅ Verification Steps

After creating your super admin account:

### 1. Test Login
- Logout of any current session
- Login with your super admin credentials
- Verify successful authentication

### 2. Test Dashboard Access
- Navigate to `/super-admin-dashboard`
- Verify you can see the dashboard without access denied errors
- Check that all tabs (Dashboard, Pending, Users, Teachers, Logs) are accessible

### 3. Test Core Functions
- **User Management**: Try viewing all users
- **Approval System**: Create a test student account and approve it
- **Teacher Creation**: Try creating a test teacher account
- **Activity Logs**: Verify logs are being recorded

### 4. Test Navigation
- Check that the header shows super admin navigation
- Verify the logo redirects to super admin dashboard
- Test mobile navigation works correctly

## 🚨 Troubleshooting

### Issue: "Access Denied" Error
**Solution**: 
- Verify the role is exactly `'super_admin'` (case-sensitive)
- Check approval_status is `'approved'`
- Clear browser cache and cookies
- Try logging out and back in

### Issue: Dashboard Not Loading
**Solution**:
- Check browser console for errors
- Verify database migration was applied correctly
- Ensure all required tables exist
- Check network connectivity to Supabase

### Issue: Functions Not Working
**Solution**:
- Verify database functions were created correctly
- Check RLS policies are properly configured
- Ensure service role has necessary permissions

### Issue: Can't Create Teachers
**Solution**:
- Verify you have super admin role
- Check that the teacher creation form loads
- Ensure all required fields are filled
- Check browser console for API errors

## 📋 Post-Setup Checklist

- [ ] Super admin account created successfully
- [ ] Can login with super admin credentials
- [ ] Super admin dashboard loads correctly
- [ ] All dashboard tabs are accessible
- [ ] Can view and manage users
- [ ] Can approve/reject pending students
- [ ] Can create new teacher accounts
- [ ] Activity logs are working
- [ ] Navigation shows super admin options
- [ ] Mobile navigation works

## 🔄 Multiple Super Admins

To create additional super admin accounts:

1. **Use the Teacher Creation Form** (modify temporarily):
   - Login as existing super admin
   - Modify the teacher creation form to allow super admin role
   - Create the account
   - Revert the form changes

2. **Use SQL Commands**:
   ```sql
   -- Promote existing user to super admin
   UPDATE profiles 
   SET role = 'super_admin'
   WHERE email = 'another-admin@example.com';
   ```

## 📞 Support

If you encounter issues:

1. **Check the Implementation Guide**: [`SUPER_ADMIN_IMPLEMENTATION.md`](project/SUPER_ADMIN_IMPLEMENTATION.md:1)
2. **Review Database Schema**: Ensure migration was applied correctly
3. **Check Browser Console**: Look for JavaScript errors
4. **Verify Supabase Connection**: Test database connectivity
5. **Review RLS Policies**: Ensure proper permissions are set

---

**Important**: Keep your super admin credentials secure and only share with trusted team members. The super admin role has full system access and should be used responsibly.
# Manual Super Admin Setup Guide

If you encounter issues with the automated migration, follow this manual setup process.

## 🔧 **Manual Setup Method (Recommended)**

### Step 1: Apply Main Migration
First, apply the main super admin system migration:

```sql
-- Run this in your Supabase SQL Editor
-- File: project/supabase/migrations/20250802000000_create_super_admin_system.sql
```

### Step 2: Register a Regular Account
1. Go to your application's `/register` page
2. Register with these details:
   - **Name**: Super Administrator
   - **Email**: `superadmin@gatepreportal.com` (or your preferred email)
   - **Password**: `SuperAdmin123!` (or your preferred password)
   - **Registration Number**: `ADMIN001`
   - **Department**: Administration

### Step 3: Upgrade to Super Admin via Supabase Dashboard
1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project

2. **Go to Table Editor**
   - Click "Table Editor" in the sidebar
   - Select the "profiles" table

3. **Find Your Account**
   - Look for the email you just registered with
   - Click on the row to edit it

4. **Update the Role**
   - Change `role` from `student` to: `super_admin`
   - Change `approval_status` from `pending` to: `approved`
   - Set `approved_at` to current timestamp (click the calendar icon)
   - Click "Save"

### Step 4: Test Access
1. **Logout** from any current session
2. **Login** with your credentials
3. **Navigate** to `/super-admin-dashboard`
4. **Verify** you can access all super admin features

## 🔄 **Alternative SQL Method**

If you prefer using SQL commands:

```sql
-- Step 1: Find your user ID (replace with your email)
SELECT id, email, role, approval_status FROM profiles 
WHERE email = 'superadmin@gatepreportal.com';

-- Step 2: Upgrade to super admin (replace with your email)
UPDATE profiles 
SET 
  role = 'super_admin',
  approval_status = 'approved',
  approved_at = NOW(),
  approved_by = id  -- Self-approved for initial setup
WHERE email = 'superadmin@gatepreportal.com';

-- Step 3: Verify the change
SELECT id, email, role, approval_status, approved_at FROM profiles 
WHERE email = 'superadmin@gatepreportal.com';
```

## 🎯 **Quick Verification Checklist**

After setup, verify these work:

- [ ] Can login with your credentials
- [ ] Redirected to `/super-admin-dashboard` after login
- [ ] Can see dashboard statistics
- [ ] Can access "Pending Approvals" tab
- [ ] Can access "All Users" tab
- [ ] Can access "Teacher Management" tab
- [ ] Can access "Activity Logs" tab
- [ ] Can create a test teacher account
- [ ] Header shows super admin navigation options

## 🔐 **Default Credentials (If Using Manual Registration)**

**Email**: `superadmin@gatepreportal.com`  
**Password**: `SuperAdmin123!`

⚠️ **Security Note**: Change these credentials immediately after setup!

## 🚨 **Troubleshooting**

### Issue: "Access Denied" Error
**Solution**: 
- Verify role is exactly `super_admin` (case-sensitive)
- Check approval_status is `approved`
- Clear browser cache and try again

### Issue: Can't See Super Admin Dashboard
**Solution**:
- Check the URL is `/super-admin-dashboard`
- Verify you're logged in with the super admin account
- Check browser console for errors

### Issue: Database Migration Errors
**Solution**:
- Apply migrations one at a time
- Check Supabase logs for specific error messages
- Ensure you have proper database permissions

## 📞 **Need Help?**

If you encounter issues:
1. Check the browser console for error messages
2. Verify database migration was applied successfully
3. Ensure you're using the correct email/password
4. Try the manual SQL method as an alternative

---

**This manual method is 100% reliable and avoids any potential auth.users table conflicts.**
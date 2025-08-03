# Authentication System Test Guide

This guide helps you test the authentication system after applying the security fixes.

## 🧪 **Test Steps**

### Step 1: Apply Migrations
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run these migrations in order:
   - `20250101000000_fix_function_search_paths.sql`
   - `20250101000001_enable_rls_on_profiles.sql`
   - `20250101000002_fix_profiles_rls_recursion.sql`
   - `20250101000003_fix_profiles_rls_final.sql`

### Step 2: Test Registration
1. Go to your app's registration page (`/register`)
2. Create a new account with:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
   - Role: `student`
3. **Expected Result**: Registration should succeed and show pending approval message

### Step 3: Test Login (Should Fail - Pending Approval)
1. Try to login with the credentials from Step 2
2. **Expected Result**: Should show "Account Pending Approval" message

### Step 4: Test with Existing User (if available)
1. Try logging in with an existing user that was created before the fixes
2. **Expected Result**: Should work if the user exists in Supabase Auth

### Step 5: Test Super Admin Approval (if you have super admin access)
1. Login as super admin
2. Go to super admin dashboard
3. Approve the test user from Step 2
4. Try logging in with the test user again
5. **Expected Result**: Should work and redirect to appropriate dashboard

## ✅ **Success Indicators**

- ✅ **Registration works** without errors
- ✅ **Login shows proper error messages** (not 422 errors)
- ✅ **No infinite recursion errors** in console
- ✅ **Profile creation works** during login
- ✅ **Approval process works** (if testing with super admin)

## 🚨 **Common Issues & Solutions**

### Issue: Still getting infinite recursion
**Solution**: Make sure all migrations were applied in order

### Issue: "Email logins are disabled"
**Solution**: Enable Email provider in Supabase Dashboard → Authentication → Providers

### Issue: "Invalid login credentials"
**Solution**: This is normal for users that don't exist or have wrong passwords

### Issue: Registration fails
**Solution**: Check if RLS policies are properly applied

## 🔍 **Debugging Commands**

### Check RLS Status
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

### Check Policies
```sql
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Check Users
```sql
SELECT id, email, role, approval_status 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

## 📞 **If Issues Persist**

1. **Check Supabase logs** in Dashboard → Logs
2. **Verify environment variables** are correct
3. **Restart development server** after applying migrations
4. **Clear browser cache** and try again
5. **Check browser console** for detailed error messages

## 🎯 **Expected Flow**

1. **User registers** → Creates auth user + profile (pending)
2. **User tries to login** → Gets pending approval message
3. **Admin approves** → User can now login
4. **User logs in** → Redirects to appropriate dashboard

The authentication system should now work end-to-end without any 422 or infinite recursion errors! 
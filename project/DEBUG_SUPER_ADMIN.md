# Debug Super Admin Account

## 🔍 **Step-by-Step Debugging**

### **Step 1: Check Database Records**

Run these queries in Supabase SQL Editor:

```sql
-- 1. Check if super admin profile exists
SELECT 
    id, 
    name, 
    email, 
    role, 
    approval_status, 
    created_at,
    auth_provider
FROM profiles 
WHERE email = 'superadmin@gatepreportal.com';
```

**Expected Result**: Should show one row with `role = 'super_admin'` and `approval_status = 'approved'`

```sql
-- 2. Check if auth user exists  
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    created_at,
    encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 'superadmin@gatepreportal.com';
```

**Expected Result**: Should show one row with `has_password = true` and `email_confirmed_at` not null

```sql
-- 3. Check if IDs match between auth.users and profiles
SELECT 
    'auth.users' as table_name, id, email 
FROM auth.users 
WHERE email = 'superadmin@gatepreportal.com'
UNION ALL
SELECT 
    'profiles' as table_name, id, email 
FROM profiles 
WHERE email = 'superadmin@gatepreportal.com';
```

**Expected Result**: Both rows should have the same ID

### **Step 2: Test Login Process**

1. **Open Browser Console** (F12 → Console tab)

2. **Go to** `/login`

3. **Login with**:
   - Email: `superadmin@gatepreportal.com`
   - Password: `SuperAdmin123!`

4. **Watch the console output** - look for messages like:
   - "Profile detected, navigating to dashboard... super_admin"
   - Any error messages

### **Step 3: Check What Happens After Login**

After attempting login, tell me:

**A. Did login succeed?**
- ✅ Login successful, redirected somewhere
- ❌ Login failed with error message
- ❌ Login succeeded but stayed on login page

**B. Where were you redirected?**
- `/super-admin-dashboard` ✅ (correct)
- `/student-main-dashboard` ❌ (wrong - means role detection failed)
- `/teacher-main-dashboard` ❌ (wrong - means role detection failed)
- Stayed on `/login` ❌ (login failed)

**C. Console messages** - copy any error messages you see

### **Step 4: Manual URL Test**

If login succeeds but you're redirected to wrong dashboard:

1. **Manually navigate to**: `http://localhost:5173/super-admin-dashboard`
2. **Tell me what happens**:
   - ✅ Super admin dashboard loads correctly
   - ❌ Redirected away (means authentication failed)
   - ❌ Page shows error or "Access denied"

### **Step 5: Check Browser Storage**

In browser console, run:
```javascript
// Check what's stored in the auth store
console.log('Auth state:', JSON.stringify({
  user: window.localStorage.getItem('sb-upgzorwatmvvuemxceyx-auth-token'),
  profile: window.localStorage.getItem('gateprep-profile')
}, null, 2));
```

## 🔧 **Common Issues & Fixes**

### **Issue 1: Role is not 'super_admin'**
If profile shows different role:
```sql
UPDATE profiles 
SET role = 'super_admin', approval_status = 'approved' 
WHERE email = 'superadmin@gatepreportal.com';
```

### **Issue 2: IDs don't match**
```sql
-- Delete and recreate with bulletproof script
DELETE FROM profiles WHERE email = 'superadmin@gatepreportal.com';
DELETE FROM auth.users WHERE email = 'superadmin@gatepreportal.com';
-- Then run the bulletproof super admin creation script
```

### **Issue 3: Email not confirmed**
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'superadmin@gatepreportal.com';
```

## 📋 **Report Back**

Please run the database queries and login test, then tell me:
1. **Database query results**
2. **What happens when you login**
3. **Any console error messages**
4. **Where you get redirected**

This will help me identify the exact issue!
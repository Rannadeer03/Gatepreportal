# Debug Checklist - Fix Login and RLS Issues

## 🚨 **Current Issues**
1. ❌ RLS policy violation for system_logs table
2. ❌ Invalid login credentials for super admin

## ✅ **Step-by-Step Fixes**

### Step 1: Apply RLS Migration
Run this in Supabase SQL Editor:
```sql
-- Copy contents from: project/supabase/migrations/20250216190000_fix_system_logs_rls.sql
```

### Step 2: Create Super Admin Account  
Run this in Supabase SQL Editor:
```sql
-- Copy contents from: project/supabase/migrations/20250216200000_create_simple_super_admin.sql
```

### Step 3: Disable Email Confirmation (CRITICAL)
1. Go to Supabase Dashboard → Authentication → Settings
2. Turn OFF "Enable email confirmations"
3. Save changes

### Step 4: Restart Development Server
```bash
npm run dev
```

### Step 5: Test Super Admin Login
1. Go to `/login`
2. Email: `superadmin@gatepreportal.com`
3. Password: `SuperAdmin123!`
4. Should redirect to super admin dashboard

### Step 6: Test Student Registration
1. Go to `/register`
2. Fill out student registration form
3. Should show success message about admin approval

### Step 7: Test Teacher Creation
1. From super admin dashboard
2. Create teacher with faculty ID: `RA2411026010955`
3. Should work without UUID errors

## 🔍 **Verification Commands**

Check if super admin exists:
```sql
SELECT id, email, role, approval_status 
FROM profiles 
WHERE email = 'superadmin@gatepreportal.com';
```

Check system_logs policies:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'system_logs';
```

Check auth users:
```sql
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'superadmin@gatepreportal.com';
```

## 🎯 **Expected Results**

After all fixes:
- ✅ Registration works without email errors
- ✅ Super admin can log in successfully  
- ✅ No more RLS policy violations
- ✅ Teacher creation works with faculty IDs
- ✅ Clean console logs
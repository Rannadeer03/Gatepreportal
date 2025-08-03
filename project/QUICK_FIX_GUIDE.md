# Quick Fix Guide for Development Issues

## 🚨 **Immediate Fixes Needed**

You're experiencing several issues that can be quickly resolved:

### 1. **Disable Email Confirmation (CRITICAL)**

**Problem**: Registration failing due to email confirmation errors
**Solution**: Disable email confirmation in Supabase

**Steps**:
1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Settings**
4. Find **"Enable email confirmations"**
5. **Turn it OFF** (toggle to disabled)
6. Click **Save**

### 2. **Multiple Client Warning (Optional)**

**Problem**: "Multiple GoTrueClient instances detected"
**Solution**: Restart your development server
**Steps**:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 3. **Test the Super Admin Account**

**Problem**: Need to test teacher creation
**Solution**: Use the default super admin account

**Credentials**:
- Email: `superadmin@gatepreportal.com`
- Password: `SuperAdmin123!`

**Steps**:
1. Go to `/login`
2. Use the credentials above
3. You should be redirected to super admin dashboard
4. Try creating a teacher account

### 4. **If Database Migration Needed**

If you applied the faculty_id migration, make sure it was successful:

```sql
-- Run this in Supabase SQL Editor to check faculty_id column type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'faculty_id';
```

Should return: `faculty_id | text`

## ✅ **Expected Flow After Fixes**

1. **Student Registration**: Should work without email errors
2. **Success Message**: Users see clear approval message
3. **Login Attempts**: Show proper "pending approval" message
4. **Super Admin**: Can create teachers with faculty IDs like "RA2411026010955"

## 🔄 **Testing Steps**

1. **Disable email confirmation**
2. **Restart dev server**
3. **Test student registration**
4. **Test super admin login**
5. **Test teacher creation**

The most critical fix is **disabling email confirmation** - this will resolve the registration issues immediately.
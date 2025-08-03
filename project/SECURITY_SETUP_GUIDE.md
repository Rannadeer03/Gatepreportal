# Security Setup Guide

This guide addresses the security warnings from Supabase linter and provides step-by-step instructions to secure your application.

## 🔒 **Security Issues to Address**

### 1. Function Search Path Mutable (CRITICAL)
**Issue**: Database functions don't have explicit search paths, which could lead to SQL injection attacks.

**Status**: ✅ **FIXED** - Migration `20250101000000_fix_function_search_paths.sql` has been created

### 2. Leaked Password Protection Disabled (IMPORTANT)
**Issue**: Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org.

**Status**: ⚠️ **NEEDS MANUAL SETUP**

## 🛠️ **Step-by-Step Security Setup**

### Step 1: Apply Database Migration

Run the migration to fix function search paths:

```bash
# If using Supabase CLI
supabase db push

# Or apply manually in Supabase Dashboard
# Go to SQL Editor and run the migration
```

### Step 2: Enable Leaked Password Protection

1. **Go to Supabase Dashboard**
   - Navigate to [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Enable Leaked Password Protection**
   - Go to **Authentication** → **Settings**
   - Scroll down to **Password Security**
   - **Enable** "Leaked password protection"
   - This will prevent users from using compromised passwords

3. **Configure Password Strength (Optional)**
   - In the same section, you can also configure:
     - Minimum password length
     - Require uppercase letters
     - Require lowercase letters
     - Require numbers
     - Require special characters

### Step 3: Enable Email Authentication (If Not Already Done)

1. **Go to Authentication** → **Providers**
2. **Enable** the Email provider
3. **Configure email confirmations** based on your needs:
   - **Development**: Disable email confirmations for easier testing
   - **Production**: Enable email confirmations for security

### Step 4: Additional Security Recommendations

#### 1. Enable Row Level Security (RLS)
Ensure all tables have RLS enabled with appropriate policies.

#### 2. Configure CORS Settings
- Go to **Settings** → **API**
- Configure CORS origins for your domains

#### 3. Set Up Email Templates
- Go to **Authentication** → **Email Templates**
- Customize email templates for better user experience

#### 4. Monitor Security Events
- Go to **Authentication** → **Logs**
- Monitor for suspicious activities

## ✅ **Verification Checklist**

After completing the setup:

- [ ] Database migration applied successfully
- [ ] Leaked password protection enabled
- [ ] Email authentication enabled
- [ ] No more linter warnings about function search paths
- [ ] Authentication flow works properly
- [ ] Registration and login tested successfully

## 🚨 **Important Notes**

### For Development
- Consider disabling email confirmations for easier testing
- Use strong passwords even in development
- Monitor logs for any security issues

### For Production
- Always enable email confirmations
- Enable leaked password protection
- Use strong password requirements
- Monitor authentication logs regularly
- Set up proper CORS configuration

## 🔍 **Testing Security Features**

### Test Leaked Password Protection
1. Try registering with a known compromised password (e.g., "password123")
2. Should be rejected with appropriate error message

### Test Function Security
1. All database functions should now have explicit search paths
2. No more "function_search_path_mutable" warnings

### Test Authentication Flow
1. Register new account
2. Login with credentials
3. Verify approval process works
4. Test password strength requirements

## 📞 **Support**

If you encounter issues:
1. Check Supabase documentation
2. Review authentication logs
3. Test with different browsers/devices
4. Contact support if needed

## 🔄 **Regular Maintenance**

- Monitor authentication logs monthly
- Review security settings quarterly
- Update dependencies regularly
- Test security features after updates 
# Service Role Key Setup Guide

This guide explains how to set up the service role key to enable super admin functionality for creating teacher accounts.

## 🔑 What is the Service Role Key?

The service role key is a special Supabase key that bypasses Row Level Security (RLS) policies and has admin privileges. It's required for operations like:
- Creating new user accounts
- Managing user authentication
- Administrative database operations

## 🚀 Quick Setup

### Step 1: Get Your Service Role Key

1. **Go to Supabase Dashboard**
   - Navigate to [supabase.com](https://supabase.com)
   - Sign in to your project

2. **Find the Service Role Key**
   - Go to **Settings** → **API**
   - Scroll down to **Project API keys**
   - Copy the **service_role** key (NOT the anon key)

### Step 2: Add to Environment Variables

Create or update your `.env` file in the project root:

```env
# Existing variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Add this new variable
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Restart Development Server

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## 🔒 Security Important Notes

⚠️ **CRITICAL**: The service role key has full admin access to your database. Keep it secure:

1. **Never commit to version control**
   - Add `.env` to your `.gitignore` file
   - Never share the service role key publicly

2. **Use only in trusted environments**
   - Only use in development or secure production environments
   - Never expose in client-side code (though Vite handles this)

3. **Rotate regularly**
   - Change the service role key periodically
   - Monitor for any unauthorized usage

## ✅ Verification

After setting up the service role key:

1. **Restart your development server**
2. **Login as super admin**
3. **Try creating a teacher account**
4. **Verify the operation succeeds**

## 🚨 Troubleshooting

### Error: "Service role key not configured"
- Check that `VITE_SUPABASE_SERVICE_ROLE_KEY` is set in your `.env` file
- Restart your development server after adding the variable

### Error: "User not allowed" persists
- Verify you're using the correct service role key (not the anon key)
- Check that your super admin account has the correct role in the database
- Ensure the service role key hasn't been rotated

### Environment Variable Not Loading
- Make sure the `.env` file is in the project root (same level as `package.json`)
- Check that the variable name starts with `VITE_`
- Restart the development server after changes

## 📝 Example .env File

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Other variables...
```

## 🔄 Alternative: Manual Teacher Creation

If you can't set up the service role key immediately, you can create teacher accounts manually:

1. **Create user in Supabase Auth** (via dashboard)
2. **Add profile record** in the profiles table
3. **Set role to 'teacher'** and approval_status to 'approved'

This is a temporary workaround until the service role key is properly configured. 
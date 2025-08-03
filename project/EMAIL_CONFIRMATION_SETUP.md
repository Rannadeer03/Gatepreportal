# Email Confirmation Setup Guide

## 🚫 **Disable Email Confirmation for Development**

The easiest way to fix registration issues during development is to disable email confirmation in Supabase.

### Steps to Disable Email Confirmation:

1. **Go to Supabase Dashboard**
   - Navigate to [supabase.com](https://supabase.com)
   - Select your project

2. **Navigate to Authentication Settings**
   - Click **Authentication** in the left sidebar
   - Click **Settings** tab

3. **Disable Email Confirmation**
   - Find **"Enable email confirmations"** setting
   - **Turn it OFF** (toggle to disabled)
   - Click **Save**

4. **Restart Your App**
   - Restart your development server
   - Try registration again

## ✅ **Alternative: Configure Email Provider**

If you want to keep email confirmation enabled, you need to configure an email provider:

### Option 1: Use Built-in SMTP (Recommended for Development)
1. In **Authentication** → **Settings**
2. Scroll to **SMTP Settings**
3. Configure with your email provider (Gmail, SendGrid, etc.)

### Option 2: Use Custom SMTP
1. Get SMTP credentials from your email provider
2. Configure in Supabase SMTP settings:
   - **Host**: Your SMTP server
   - **Port**: Usually 587 or 465
   - **Username**: Your email
   - **Password**: App-specific password

## 🔧 **Current Registration Flow**

With the fixes I've made:

1. **Registration attempts** with email confirmation
2. **If email fails**: Registration continues anyway for manual approval
3. **Profile is created** with pending status
4. **Super admin can approve** the user later

## 📝 **Recommended for Development**

For development purposes, I recommend:

1. **Disable email confirmation** (simplest solution)
2. **Use the super admin approval system** instead
3. **Re-enable email confirmation** for production

This way, students can register immediately and super admins can approve them manually.
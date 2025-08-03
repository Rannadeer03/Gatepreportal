# Vercel Deployment Guide

This guide will help you fix the Vercel deployment issues and prevent 404 errors when refreshing pages.

## 🚨 **Current Issue**
You're experiencing `404: NOT_FOUND` errors when refreshing pages on Vercel. This is a common issue with Single Page Applications (SPAs).

## ✅ **Files Created/Fixed**

### 1. `vercel.json` - Main Configuration
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

**What this does:**
- Routes all requests to `index.html` (SPA routing)
- Specifies build commands for Vercel
- Sets the correct output directory

### 2. `.vercelignore` - Optimize Deployment
```
node_modules
.git
.gitignore
README.md
*.log
.env.local
.env.development.local
.env.test.local
.env.production.local
supabase/
*.md
```

**What this does:**
- Excludes unnecessary files from deployment
- Reduces deployment size and time
- Prevents sensitive files from being uploaded

### 3. Updated `vite.config.ts`
```typescript
build: {
  outDir: 'dist',
  sourcemap: false,
}
```

**What this does:**
- Ensures consistent build output
- Disables sourcemaps for production

## 🚀 **Deployment Steps**

### Step 1: Commit Your Changes
```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push
```

### Step 2: Redeploy on Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Deployments** tab
4. Click **Redeploy** on the latest deployment
5. Or trigger a new deployment by pushing to your main branch

### Step 3: Verify Environment Variables
Make sure these environment variables are set in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`

**To set them:**
1. Go to **Settings** → **Environment Variables**
2. Add each variable with the correct values
3. Redeploy after adding variables

## 🔧 **Troubleshooting**

### If Still Getting 404 Errors:

1. **Check Build Logs**
   - Go to Vercel dashboard → Deployments
   - Click on the latest deployment
   - Check **Build Logs** for errors

2. **Verify Build Output**
   - The build should create a `dist` folder
   - `dist/index.html` should exist

3. **Check Framework Detection**
   - Vercel should detect this as a Vite project
   - If not, the `vercel.json` will override

### Common Issues:

1. **Build Fails**
   - Check if all dependencies are in `package.json`
   - Ensure `npm run build` works locally

2. **Environment Variables Missing**
   - Add all required Supabase variables
   - Redeploy after adding variables

3. **Routing Issues**
   - The `vercel.json` rewrite rule should fix this
   - If not, check if the deployment is using the new config

## ✅ **Verification Checklist**

After deployment:
- [ ] Homepage loads without errors
- [ ] Navigation between pages works
- [ ] Page refresh works (no 404 errors)
- [ ] Authentication flows work
- [ ] All features function correctly

## 🎯 **Expected Behavior**

After fixing:
- ✅ Direct URL access works
- ✅ Page refresh works
- ✅ Browser back/forward buttons work
- ✅ Deep linking works
- ✅ No more 404 errors

## 📞 **If Issues Persist**

1. **Check Vercel Logs**
   - Function logs for server-side issues
   - Build logs for build problems

2. **Test Locally**
   ```bash
   npm run build
   npm run preview
   ```

3. **Contact Vercel Support**
   - If the issue persists after all fixes
   - Include deployment URL and error logs

## 🔄 **Automatic Deployments**

Once fixed, Vercel will automatically:
- Deploy on every push to main branch
- Use the new configuration
- Handle SPA routing correctly

The deployment should now work correctly without 404 errors! 🎉 
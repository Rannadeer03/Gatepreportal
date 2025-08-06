# 🚀 Production Deployment Guide

## 📋 **Pre-Deployment Checklist**

### 1. Environment Setup
```bash
# Ensure all environment variables are set
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Migration
```bash
# Apply all migrations to production database
supabase db push
```

### 3. Edge Functions Deployment
```bash
# Deploy edge functions
supabase functions deploy email-notifications
```

## 🚀 **Deployment Options**

### Option 1: Vercel (Recommended)

#### Step 1: Connect to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Step 2: Configure Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all required environment variables

#### Step 3: Configure Domain
1. Go to Settings > Domains
2. Add your custom domain
3. Configure DNS settings

### Option 2: Netlify

#### Step 1: Connect to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

#### Step 2: Configure Environment Variables
1. Go to Netlify Dashboard
2. Select your site
3. Go to Site Settings > Environment Variables
4. Add all required environment variables

## 🔧 **Supabase Production Setup**

### 1. Database Configuration
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- ... (all other tables)

-- Apply all RLS policies
-- (These are already in your migrations)
```

### 2. Storage Configuration
```sql
-- Ensure storage buckets are created
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('test_images', 'test_images', true),
  ('assignments', 'assignments', true),
  ('course_materials', 'course_materials', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

### 3. Edge Functions
```bash
# Deploy edge functions
supabase functions deploy email-notifications --project-ref your-project-ref
```

## 📊 **Monitoring Setup**

### 1. Performance Dashboard
- Access at `/performance-dashboard`
- Monitor key metrics
- Set up alerts for critical thresholds

### 2. Error Tracking
- Monitor error rates
- Set up alerts for high error rates
- Review error logs regularly

### 3. User Analytics
- Track user behavior
- Monitor feature usage
- Analyze performance bottlenecks

## 🔒 **Security Configuration**

### 1. Environment Variables
```bash
# Never commit these to git
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. CORS Configuration
```javascript
// In Supabase Dashboard
// Go to Settings > API
// Configure CORS origins
```

### 3. Rate Limiting
- Implemented in auth store
- Monitor for abuse
- Adjust limits as needed

## 🚨 **Post-Deployment Verification**

### 1. Functionality Testing
```bash
# Test all major features
- User registration
- Login/logout
- Test creation
- Test taking
- File uploads
- Notifications
```

### 2. Performance Testing
```bash
# Check performance metrics
- Page load times < 2 seconds
- API response times < 1000ms
- Error rate < 1%
```

### 3. Security Testing
```bash
# Verify security measures
- Authentication works
- Authorization is enforced
- RLS policies are active
- Rate limiting works
```

## 📈 **Scaling Considerations**

### 1. Database Scaling
- Supabase handles automatic scaling
- Monitor query performance
- Optimize slow queries
- Use indexes where needed

### 2. Application Scaling
- Vercel/Netlify handle scaling
- Monitor build times
- Optimize bundle size
- Use CDN for static assets

### 3. Storage Scaling
- Monitor storage usage
- Implement cleanup policies
- Optimize file sizes
- Use compression

## 🔄 **Continuous Deployment**

### 1. GitHub Integration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 2. Environment Management
```bash
# Development
vercel env add VITE_SUPABASE_URL

# Production
vercel env add VITE_SUPABASE_URL --prod
```

## 🛠 **Troubleshooting**

### Common Issues

#### 1. Build Failures
```bash
# Check for missing dependencies
npm install

# Clear cache
npm run build -- --force

# Check environment variables
echo $VITE_SUPABASE_URL
```

#### 2. Database Connection Issues
```bash
# Test connection
supabase status

# Check RLS policies
supabase db diff
```

#### 3. Performance Issues
```bash
# Check bundle size
npm run build
npx vite-bundle-analyzer

# Optimize images
npm run optimize-images
```

## 📞 **Support & Monitoring**

### 1. Error Monitoring
- Set up error tracking
- Configure alerts
- Monitor error rates

### 2. Performance Monitoring
- Track page load times
- Monitor API response times
- Set up performance alerts

### 3. User Support
- Set up support channels
- Create documentation
- Monitor user feedback

## 🎯 **Success Metrics**

### Technical Metrics
- 99.9% uptime
- < 2 second page load times
- < 1% error rate
- < 1000ms API response times

### User Metrics
- User registration completion rate > 80%
- Test completion rate > 70%
- User retention rate > 60%

---

**Remember**: Deployment is just the beginning! Monitor, optimize, and iterate based on user feedback. 🚀 
# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier available)
- Your code pushed to a GitHub repository

## Step 1: Push to GitHub
```bash
# Navigate to your frontend directory
cd "p:\SIPPY\PROJECTS\webapp\webApp\frontend"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Production ready"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/universal-liquors-frontend.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: Leave empty (or set to `frontend` if deploying from monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option B: Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to your project
cd "p:\SIPPY\PROJECTS\webapp\webApp\frontend"

# Deploy
vercel --prod
```

## Step 3: Configure Environment Variables
In your Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
VITE_API_BASE_URL=https://univeral-liquors-webapp-test.onrender.com/api
VITE_MODE=production
VITE_AUTHORIZE_NET_PUBLIC_KEY=6B4Q9sxea5yGzj35Ejz9NfkFATVH9J955Zh9dhTeFs84Sam6JPdc5C93eL3Rw7fN
VITE_AUTHORIZE_NET_API_LOGIN_ID=5Hww42Qn
```

**Important**: Make sure to set these for "Production" environment.

## Step 4: Verify Deployment
1. Check your live URL (provided by Vercel)
2. Test key functionality:
   - ✅ Homepage loads
   - ✅ Product catalog works
   - ✅ User authentication
   - ✅ Cart functionality
   - ✅ Payment processing
   - ✅ CMS content loads

## Step 5: Custom Domain (Optional)
1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 🔧 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Verify build command is `npm run build`

### Routing Issues (404 on refresh)
- Ensure `vercel.json` is properly configured (already done)
- Check that SPA routing is handled correctly

### API Connection Issues
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings on your backend
- Ensure backend is accessible from Vercel

### Environment Variables Not Working
- Variables must be prefixed with `VITE_`
- Set them in Vercel Dashboard, not in code
- Redeploy after changing environment variables

## ✅ Post-Deployment Checklist
- [ ] Site loads correctly
- [ ] All images display
- [ ] Navigation works
- [ ] Forms submit properly
- [ ] Payments process correctly
- [ ] Mobile responsive
- [ ] Performance is acceptable
- [ ] SEO meta tags are present

## 🎯 Your Deployment URLs
- **Production**: https://your-project-name.vercel.app
- **Preview**: Auto-generated for each pull request

## 🔄 Continuous Deployment
- Every push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- No manual intervention needed

## 📊 Monitoring
- Vercel provides analytics and performance metrics
- Set up alerts for deployment failures
- Monitor Web Vitals and user experience

@echo off
REM Universal Liquors Frontend - Quick Vercel Deployment Script (Windows)

echo 🚀 Universal Liquors Frontend - Vercel Deployment
echo ==================================================

REM Step 1: Verify we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the frontend directory.
    exit /b 1
)

REM Step 2: Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Step 3: Run production build test
echo 🔨 Testing production build...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix build errors before deploying.
    exit /b 1
)

echo ✅ Build successful!

REM Step 4: Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📥 Installing Vercel CLI...
    call npm install -g vercel
)

REM Step 5: Deploy to Vercel
echo 🚀 Deploying to Vercel...
call vercel --prod

echo.
echo 🎉 Deployment complete!
echo.
echo Next steps:
echo 1. Set environment variables in Vercel Dashboard
echo 2. Test your live site
echo 3. Configure custom domain (optional)
echo.
echo Need help? Check DEPLOYMENT.md for detailed instructions.

pause

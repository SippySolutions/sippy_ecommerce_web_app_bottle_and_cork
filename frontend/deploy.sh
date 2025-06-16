#!/bin/bash

# Universal Liquors Frontend - Quick Vercel Deployment Script

echo "🚀 Universal Liquors Frontend - Vercel Deployment"
echo "=================================================="

# Step 1: Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Run production build test
echo "🔨 Testing production build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Step 4: Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Step 5: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Vercel Dashboard"
echo "2. Test your live site"
echo "3. Configure custom domain (optional)"
echo ""
echo "Need help? Check DEPLOYMENT.md for detailed instructions."

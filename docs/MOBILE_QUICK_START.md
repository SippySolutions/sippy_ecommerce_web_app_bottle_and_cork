# 🚀 Mobile App Quick Start Guide

Welcome to Universal Liquors mobile app development! This guide will get you up and running quickly.

## ⚡ Quick Setup (5 minutes)

### 1. Prerequisites
- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ Code editor (VS Code recommended)

### 2. Initial Setup
```bash
# Navigate to frontend directory
cd frontend

# Run the setup script
# Windows:
scripts\setup-mobile.bat

# macOS/Linux:
chmod +x scripts/setup-mobile.sh
./scripts/setup-mobile.sh
```

### 3. Development
```bash
# Start development
./dev-mobile.sh    # macOS/Linux
dev-mobile.bat     # Windows

# Or manually:
npm run android:dev  # Android with live reload
npm run ios:dev      # iOS with live reload (macOS only)
```

## 📱 Platform Specific Setup

### 🤖 Android Development

#### Prerequisites:
- Java 17+
- Android Studio
- Android SDK (API 24+)

#### Quick Commands:
```bash
# Add Android platform
npx cap add android

# Build and run
npm run android:dev

# Open in Android Studio
npx cap open android

# Build release APK
npm run android:release
```

### 🍎 iOS Development (macOS only)

#### Prerequisites:
- Xcode 14+
- iOS SDK
- macOS 12+

#### Quick Commands:
```bash
# Add iOS platform
npx cap add ios

# Build and run
npm run ios:dev

# Open in Xcode
npx cap open ios

# Build for App Store
npm run ios:release
```

## 🎯 Key Files & Directories

```
frontend/
├── capacitor.config.json    # Capacitor configuration
├── .env.mobile             # Mobile environment variables
├── resources/              # App icons and splash screens
│   ├── icon.png           # 1024x1024 app icon
│   └── splash.png         # 2732x2732 splash screen
├── android/               # Android project (generated)
├── ios/                   # iOS project (generated)
├── scripts/               # Setup and build scripts
└── docs/                  # Documentation
```

## 🔧 Essential Commands

### Build Commands
```bash
npm run build:mobile       # Build for mobile
npm run cap:sync           # Sync web assets to native
npm run cap:build          # Build and sync
```

### Development Commands
```bash
npm run android:dev        # Android development
npm run ios:dev           # iOS development
npm run mobile:clean      # Clean and resync
```

### Release Commands
```bash
npm run android:release   # Build Android release
npm run ios:release       # Build iOS release
```

## 🎨 Customization

### 1. App Identity
Update `capacitor.config.json`:
```json
{
  "appId": "com.sippysolution.universalliquor",
  "appName": "Universal Liquors",
  "webDir": "dist"
}
```

### 2. App Icons & Splash
1. Add `resources/icon.png` (1024x1024)
2. Add `resources/splash.png` (2732x2732)
3. Generate resources:
```bash
npm install -g @capacitor/assets
npx @capacitor/assets generate
```

### 3. Environment Variables
Update `.env.mobile` with your settings:
```env
VITE_API_BASE_URL=https://your-api.com
VITE_APP_NAME=Universal Liquors
CAPACITOR_APP_ID=com.sippysolution.universalliquor
```

## 🏪 Store Deployment

### 🤖 Google Play Store
1. Generate keystore: `scripts/generate-keystore.bat`
2. Build release: `npm run android:release`
3. Follow: `docs/APP_STORE_PUBLISHING_GUIDE.md`

### 🍎 Apple App Store
1. Set up certificates and profiles
2. Build for release: `npm run ios:release`
3. Follow: `docs/APP_STORE_PUBLISHING_GUIDE.md`

## 🚀 CI/CD Pipeline

### Automated Deployment
The project includes a professional CI/CD pipeline that:
- ✅ Builds both Android and iOS
- ✅ Runs quality checks
- ✅ Deploys to app stores
- ✅ Handles beta and production releases

### Setup GitHub Secrets
Follow: `docs/GITHUB_SECRETS_SETUP.md`

## 🔍 Testing

### Device Testing
```bash
# Test on connected Android device
npx cap run android --target=device

# Test on iOS simulator
npx cap run ios --target=simulator

# Test with live reload
npm run android:dev
npm run ios:dev
```

### Debugging
```bash
# Open Chrome DevTools for Android
chrome://inspect

# Use Safari Web Inspector for iOS
# Safari → Develop → [Device] → localhost
```

## 📊 Next Steps

### Immediate Actions
1. [ ] Update app icon and splash screen
2. [ ] Configure environment variables  
3. [ ] Test on real devices
4. [ ] Set up developer accounts
5. [ ] Configure CI/CD secrets

### Before Launch
1. [ ] Complete age verification implementation
2. [ ] Add privacy policy and terms
3. [ ] Test payment processing
4. [ ] Implement push notifications
5. [ ] Performance optimization

### Post-Launch
1. [ ] Monitor app performance
2. [ ] Collect user feedback
3. [ ] Plan feature updates
4. [ ] Optimize app store listings

## 🆘 Troubleshooting

### Common Issues

**Build Errors**:
```bash
# Clean and rebuild
npm run mobile:clean
npm run cap:build
```

**Sync Issues**:
```bash
# Force sync
npx cap sync --clean
```

**Platform Issues**:
```bash
# Remove and re-add platform
npx cap platform rm android
npx cap add android
```

### Getting Help
- 📖 [Capacitor Docs](https://capacitorjs.com/docs)
- 📱 [App Store Guide](docs/APP_STORE_PUBLISHING_GUIDE.md)
- 🔐 [Secrets Setup](docs/GITHUB_SECRETS_SETUP.md)
- 🎨 [Resources Guide](resources/README.md)

## 🎉 You're Ready!

Your mobile app development environment is set up and ready to go. Start with:

```bash
# Windows
dev-mobile.bat

# macOS/Linux  
./dev-mobile.sh
```

Happy coding! 🚀

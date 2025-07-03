# App Store Deployment Guide for Universal Liquors

## ✅ Recent Updates - iOS Status Bar Fix

### iOS UI Improvements (January 2025)
- **Fixed iOS Status Bar Gap**: Eliminated the transparent gap between status bar and navbar on iOS
- **Cross-Platform Compatibility**: Maintains consistent experience across web, Android, and iOS
- **Configuration Updates**: 
  - Capacitor config: `overlaysWebView: true` for iOS
  - StatusBar: Platform-specific handling
  - CSS: Enhanced safe area support

### Quick Test
```bash
# Test the iOS build with status bar fixes
npm run ios:dev
```

---

## Prerequisites ✅ (Check these first)

### 1. Apple Developer Account
- [ ] Active Apple Developer Program membership ($99/year)
- [ ] Access to App Store Connect
- [ ] Valid certificates and provisioning profiles

### 2. Development Environment
- [ ] Xcode installed (latest version recommended)
- [ ] iOS Simulator for testing
- [ ] Valid Apple ID signed into Xcode

### 3. App Store Connect Setup
- [ ] App created in App Store Connect
- [ ] App Store listing information completed
- [ ] Screenshots and metadata prepared

## Step-by-Step Deployment Process

### Step 1: Build and Test the App

First, let's build and test the iOS app:

```bash
cd /Users/Preet/Dev/univeral_liquors_webapp_test/frontend

# Build the web app for mobile
npm run build:mobile

# Sync with iOS
npm run cap:sync

# Open in Xcode for testing
npm run cap:open ios
```

### Step 2: Configure App in Xcode

1. **Open the project in Xcode:**
   - The above command will open Xcode with your project
   - File location: `ios/App/App.xcworkspace`

2. **Configure App Settings:**
   - Select the App target in Xcode
   - Go to "Signing & Capabilities"
   - Set your Team (Apple Developer Account)
   - Verify Bundle Identifier: `com.sippysolution.universalliquor`
   - Set up automatic signing or manual provisioning profiles

3. **Set Version and Build Number:**
   - In General tab, set:
     - Version: 1.0.0 (or your preferred version)
     - Build: 1 (increment for each submission)

### Step 3: Test on Device (Recommended)

```bash
# Test on connected iOS device
npm run ios:dev
```

### Step 4: Create App Store Connect Entry

1. **Go to App Store Connect:** https://appstoreconnect.apple.com
2. **Create New App:**
   - Click "+" and select "New App"
   - Platform: iOS
   - Name: Universal Liquors
   - Primary Language: English
   - Bundle ID: com.sippysolution.universalliquor
   - SKU: (unique identifier, e.g., universal-liquors-001)

### Step 5: Prepare App Store Assets

You'll need these assets (create them if not available):

#### App Icons (all sizes required):
- 1024x1024 (App Store)
- 180x180 (iPhone 6 Plus)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 87x87 (iPhone notification)
- 80x80 (iPad notification)
- 76x76 (iPad)
- 60x60 (iPhone notification)
- 58x58 (iPhone notification)
- 40x40 (iPad notification)
- 29x29 (iPhone/iPad settings)
- 20x20 (iPad notification)

#### Screenshots (required for submission):
- iPhone screenshots (various sizes)
- iPad screenshots (if supporting iPad)

### Step 6: Build for App Store Distribution

#### Option A: Using Xcode GUI (Recommended for first-time)

1. **In Xcode:**
   - Select "Any iOS Device" as destination
   - Product → Archive
   - Wait for archive to complete
   - Xcode Organizer will open

2. **Upload to App Store:**
   - Select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow the wizard

#### Option B: Using Command Line

```bash
# Build archive
npm run ios:release

# Upload using xcodebuild (alternative)
# Note: You'll need to configure this command with your specific settings
xcodebuild -exportArchive \
  -archivePath ./ios/build/App.xcarchive \
  -exportPath ./ios/build/ \
  -exportOptionsPlist ./ios/ExportOptions.plist
```

### Step 7: Complete App Store Connect Setup

1. **App Information:**
   - Privacy Policy URL
   - Category (Food & Drink / Shopping)
   - Content Rights
   - Age Rating

2. **Pricing and Availability:**
   - Set price (Free or Paid)
   - Select countries/regions

3. **App Store Information:**
   - App name: Universal Liquors
   - Subtitle (optional)
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)

4. **Build Selection:**
   - Once uploaded, select your build
   - Complete the "What's New in This Version" section

### Step 8: Submit for Review

1. **Review all sections** - ensure all are green checkmarks
2. **Click "Submit for Review"**
3. **Answer review questions** (e.g., uses IDFA, encryption)

## Important Configuration Files

### Current Capacitor Config (capacitor.config.ts)
```typescript
ios: {
  backgroundColor: '#1e1e1e',
  contentInset: 'automatic',
  scrollEnabled: true,
  allowsLinkPreview: false
}
```

### Info.plist Key Settings
Located at: `ios/App/App/Info.plist`
- App name: Universal Liquors
- Bundle identifier: com.sippysolution.universalliquor

## Troubleshooting

### Common Issues:

1. **Signing Issues:**
   - Ensure Apple Developer account is active
   - Check provisioning profiles in Xcode
   - Try automatic signing first

2. **Build Failures:**
   - Clean build: Product → Clean Build Folder in Xcode
   - Update iOS dependencies: `cd ios && pod install`

3. **Upload Issues:**
   - Verify bundle identifier matches App Store Connect
   - Check version/build numbers are incremented
   - Ensure all required icons are included

### Useful Commands:

```bash
# Clean and rebuild everything
npm run mobile:clean
npm run cap:build

# Update iOS dependencies
cd ios && pod install

# Check iOS build status
npm run ios:build
```

## Timeline Expectations

- **Review Process:** 1-7 days typically
- **First Submission:** May take longer due to additional checks
- **Updates:** Usually faster review process

## Next Steps After Approval

1. **Release Management:** You can release immediately or schedule
2. **Analytics:** Monitor downloads and user feedback
3. **Updates:** Plan regular updates and bug fixes

## Quick Start Commands

```bash
# Test the current build
npm run ios:dev

# Prepare for App Store submission
npm run build:mobile
npm run cap:sync
npm run cap:open ios
# Then use Xcode to archive and upload
```

---

**Need Help?** 
- Check Apple's official documentation
- Review App Store Review Guidelines
- Consider reaching out to Apple Developer Support

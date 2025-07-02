# Universal Liquors - Google Play Store Publishing Guide

## 🎯 Overview
This guide will walk you through publishing your Universal Liquors app to the Google Play Store.

## 📋 Prerequisites
- [x] App is working correctly on Android device/emulator
- [x] Capacitor configuration is complete
- [x] Build system is set up
- [x] Release keystore created
- [x] App icons generated (Capacitor Assets)
- [x] Splash screens generated (Capacitor Assets)
- [ ] Google Play Console account ($25 one-time fee)
- [ ] Screenshots taken
- [ ] App descriptions written

---

## Phase 1: Create Google Play Console Account

### Step 1: Create Developer Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Pay the $25 one-time developer registration fee
4. Complete the developer profile

---

## Phase 2: Prepare App for Release

### Step 1: Create Release Keystore

**CRITICAL: Keep this keystore safe! You'll need it for ALL future updates.**

```cmd
# Find Java/Android Studio keytool location:
# Usually in: C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe
# Or: C:\Program Files\Java\jdk-VERSION\bin\keytool.exe

# Run this command (replace PATH_TO_KEYTOOL):
"PATH_TO_KEYTOOL\keytool.exe" -genkey -v -keystore release-key.keystore -alias universalliquor-key -keyalg RSA -keysize 2048 -validity 10000
```

**Fill in these details when prompted:**
- Password: (Choose a strong password - REMEMBER THIS!)
- First and last name: Universal Liquors
- Organizational unit: Sippy Solutions
- Organization: Sippy Solutions
- City: [Your City]
- State: [Your State/Province]
- Country: [Your Country Code]

### Step 2: Update Signing Configuration

Your `android/gradle.properties` has been updated. **Replace these values:**
```properties
MYAPP_RELEASE_STORE_PASSWORD=your_actual_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_actual_key_password
```

### Step 3: Update App Information

Edit `android/app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.sippysolutions.universalliquors"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1          // Increment for each release
    versionName "1.0.0"    // User-visible version
}
```

---

## Phase 3: Prepare App Assets

### Step 1: App Icons (Generated with Capacitor Assets)

✅ **Already completed!** Your app icons have been generated using Capacitor Assets.

**What was generated:**
- All Android icon sizes in `android/app/src/main/res/mipmap-*/`
- Adaptive icons with foreground and background layers
- Round icons for Android
- All density variations (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

**To regenerate icons (if needed):**
```cmd
# Place your source icon in resources/icon.png (1024x1024)
npx capacitor-assets generate --android
```

### Step 1b: Splash Screens (Generated with Capacitor Assets)

✅ **Already completed!** Your splash screens have been generated.

**What was generated:**
- Portrait and landscape splash screens
- Light and dark theme variations
- All Android densities and screen sizes
- Located in `android/app/src/main/res/drawable-*/`

### Step 2: Feature Graphic
- Size: 1024x500 pixels
- Format: PNG or JPEG
- Shows in Play Store listing

### Step 3: Screenshots (Required)
- At least 2 screenshots
- Phone: 16:9 or 9:16 aspect ratio
- Tablet: 16:10 or 10:16 aspect ratio
- Resolution: At least 320px on smallest side

### Step 4: App Listing Information
Prepare these texts:
- **Title:** "Universal Liquors" (max 50 characters)
- **Short Description:** Brief app description (max 80 characters)
- **Full Description:** Detailed description (max 4000 characters)

Example descriptions:
```
Short: "Premium liquor shopping made easy. Browse, order, and get delivered."

Full: "Universal Liquors brings premium spirits and wines directly to your door. Browse our extensive collection of whiskeys, vodkas, wines, and craft beers. Features include:

• Easy browsing by category
• Secure checkout
• Real-time order tracking
• Age verification
• Delivery scheduling

Download now and discover your new favorite spirits!"
```

---

## Phase 4: Build Release APK

### Step 1: Build for Production

**Important: Use Java 11+ for building**

```cmd
cd "p:\SIPPY\PROJECTS\webapp\webApp\frontend"

# Set Java Home to Android Studio's JDK (fixes Java 8 issue)
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"

# Build the web app
npm run build:mobile

# Sync with Capacitor
npx cap sync android

# Build release App Bundle (AAB) - preferred by Play Store
cd android
gradlew.bat bundleRelease
```

**OR use the automated script:**
```cmd
# Run the automated build script
build-release.bat
```

### Step 2: Locate Your App Bundle
The signed App Bundle (AAB) will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

**Note:** Google Play Console requires App Bundles (AAB) for new apps. AAB files are smaller and allow Google to optimize the download for each device.

---

## Phase 5: Upload to Play Console

### Step 1: Create App
1. Go to Play Console
2. Click "Create app"
3. Fill in app details:
   - App name: "Universal Liquors"
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free (or Paid)

### Step 2: Set Up App Content
1. **Privacy Policy** (Required if app handles personal data)
2. **App Access** (Choose "All functionality available")
3. **Content Rating** (Complete questionnaire - likely Teen+ due to alcohol)
4. **Target Audience** (21+ due to alcohol content)
5. **News Apps** (No, unless applicable)

### Step 3: Upload App Bundle (AAB)
**Note: Google Play Console requires App Bundles (AAB) for new apps, not APKs.**

1. Go to "Release" → "Production"
2. Click "Create new release"
3. **App Signing**: Choose "Let Google manage and protect your app signing key (recommended)"
   - This is Google's recommended approach
   - Solves keystore compatibility issues
   - Google handles all security and key management
4. Upload your `app-release.aab` (App Bundle)
5. Add release notes
6. Review and roll out

**App Bundle Location:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

**⚠️ Important**: If you're updating an existing app and get a "wrong signing key" error, choose "Let Google manage and protect your app signing key" to resolve the issue.

### Step 4: Store Listing
1. Upload all assets (icons, screenshots, feature graphic)
2. Add descriptions
3. Set category: "Food & Drink"
4. Add contact details
5. Set privacy policy URL

---

## Phase 6: Review Process

### Step 1: Submit for Review
- Google will review your app (usually 1-3 days)
- Check for policy violations
- Test functionality

### Step 2: Address Issues
If rejected:
1. Read rejection reasons carefully
2. Fix issues in your app
3. Increment `versionCode` in build.gradle
4. Build new APK
5. Upload new version

---

## 🚨 Important Considerations for Alcohol Apps

### Age Verification
- Implement robust age verification
- Comply with local laws
- May need location-based restrictions

### Content Policies
- No promotion of excessive drinking
- Include responsible drinking messaging
- Comply with advertising standards

### Geographic Restrictions
- Alcohol delivery laws vary by location
- May need to restrict availability
- Consider international regulations

---

## 🔧 Build Commands Summary

```cmd
# Development build
npm run cap:build && npx cap run android

# Release build (App Bundle for Play Store)
npm run build:mobile
npx cap sync android
cd android && gradlew.bat bundleRelease

# Release build (APK for testing)
npm run build:mobile
npx cap sync android
cd android && gradlew.bat assembleRelease

# If you need to clean
gradlew.bat clean
```

---

## 📱 Testing Checklist

Before submitting:
- [ ] App loads correctly
- [ ] All features work
- [ ] No crashes or errors
- [ ] Performance is acceptable
- [ ] Age verification works
- [ ] Payment processing works
- [ ] Meets Google Play policies

---

## 🆘 Troubleshooting

### Common Issues:
1. **Wrong signing key error:** Choose "Let Google manage and protect your app signing key" in Play Console
2. **Java version error:** Set JAVA_HOME to Android Studio's JDK: `set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"`
3. **Keystore not found:** Check file path in gradle.properties
4. **Build fails:** Run `gradlew.bat clean` then try again
5. **APK not signed:** Verify keystore passwords are correct
6. **App rejected:** Review Google Play policies carefully

### Support Resources:
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Android App Publishing Guide](https://developer.android.com/studio/publish)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)

---

## 🎉 Next Steps After Publishing

1. **Monitor reviews** and respond professionally
2. **Track analytics** in Play Console
3. **Plan updates** based on user feedback
4. **Marketing** - promote your app!

Good luck with your app launch! 🚀

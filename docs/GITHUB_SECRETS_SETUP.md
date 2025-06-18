# 🔐 GitHub Secrets Setup Guide

This guide explains how to set up all the required secrets for your CI/CD pipeline to automatically build and deploy your mobile app.

## 📋 Required Secrets Overview

### 🤖 Android Secrets
- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore file
- `ANDROID_KEY_ALIAS` - Keystore alias (usually: universalliquor-key)
- `ANDROID_KEY_PASSWORD` - Key password
- `ANDROID_STORE_PASSWORD` - Keystore password
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` - Google Play Console API key

### 🍎 iOS Secrets
- `IOS_CERTIFICATE_BASE64` - Base64 encoded distribution certificate
- `IOS_PROVISIONING_PROFILE_BASE64` - Base64 encoded provisioning profile
- `IOS_CERTIFICATE_PASSWORD` - Certificate password
- `APP_STORE_CONNECT_API_KEY_ID` - App Store Connect API key ID
- `APP_STORE_CONNECT_API_ISSUER_ID` - App Store Connect issuer ID
- `APP_STORE_CONNECT_API_KEY_BASE64` - Base64 encoded API key file

## 🤖 Android Setup

### Step 1: Generate Android Keystore

1. **Run the keystore generation script**:
   ```bash
   # On Windows
   cd frontend/scripts
   generate-keystore.bat
   
   # On macOS/Linux
   cd frontend/scripts
   chmod +x generate-keystore.sh
   ./generate-keystore.sh
   ```

2. **Keep the keystore safe**:
   - Back up the keystore file to multiple secure locations
   - Never commit the keystore to version control
   - Store passwords in a secure password manager

### Step 2: Encode Keystore for GitHub

**Windows**:
```cmd
cd frontend
certutil -encode release-key.keystore keystore-base64.txt
# Copy the content between BEGIN/END lines (without the headers)
```

**macOS/Linux**:
```bash
cd frontend
base64 -i release-key.keystore | pbcopy
# Content is copied to clipboard
```

### Step 3: Google Play Console API Setup

1. **Go to Google Play Console** → API Access
2. **Create Service Account**:
   - Click "Create Service Account"
   - Follow the link to Google Cloud Console
   - Create a new service account
   - Generate and download JSON key
3. **Grant Permissions**:
   - Back in Play Console, grant permissions to the service account
   - Enable "Releases" permissions
4. **Encode JSON key**:
   ```bash
   # Copy the entire JSON content (minified, single line)
   cat service-account-key.json | jq -c .
   ```

### Step 4: Add Android Secrets to GitHub

Go to your GitHub repository → Settings → Secrets and variables → Actions:

- `ANDROID_KEYSTORE_BASE64`: Paste the base64 encoded keystore
- `ANDROID_KEY_ALIAS`: `universalliquor-key` (or your chosen alias)
- `ANDROID_KEY_PASSWORD`: Your key password
- `ANDROID_STORE_PASSWORD`: Your keystore password
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: Paste the JSON content

## 🍎 iOS Setup

### Step 1: Apple Developer Account

1. **Enroll in Apple Developer Program** ($99/year)
2. **Create App ID**:
   - Go to Certificates, Identifiers & Profiles
   - Create new App ID: `com.sippysolution.universalliquor`
   - Enable required capabilities

### Step 2: Create Distribution Certificate

1. **Generate Certificate Signing Request (CSR)**:
   ```bash
   # Create CSR using Keychain Access or command line
   openssl req -new -newkey rsa:2048 -nodes -keyout private.key -out CertificateSigningRequest.certSigningRequest
   ```

2. **Create Certificate in Apple Developer**:
   - Go to Certificates → Production
   - Create "Apple Distribution" certificate
   - Upload your CSR
   - Download the certificate

3. **Export P12 Certificate**:
   - Open certificate in Keychain Access
   - Export as .p12 file with password
   - Encode for GitHub:
   ```bash
   base64 -i distribution_certificate.p12 | pbcopy
   ```

### Step 3: Create Provisioning Profile

1. **Create Production Provisioning Profile**:
   - Go to Profiles → Distribution
   - Create "App Store" profile
   - Select your App ID and certificate
   - Download the profile

2. **Encode Provisioning Profile**:
   ```bash
   base64 -i Universal_Liquors_App_Store.mobileprovision | pbcopy
   ```

### Step 4: App Store Connect API Key

1. **Generate API Key**:
   - Go to App Store Connect → Users and Access → Keys
   - Create new API key with "App Manager" role
   - Download the .p8 file
   - Note the Key ID and Issuer ID

2. **Encode API Key**:
   ```bash
   base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
   ```

### Step 5: Add iOS Secrets to GitHub

Add these secrets to your GitHub repository:

- `IOS_CERTIFICATE_BASE64`: Base64 encoded distribution certificate (.p12)
- `IOS_PROVISIONING_PROFILE_BASE64`: Base64 encoded provisioning profile
- `IOS_CERTIFICATE_PASSWORD`: Password for the .p12 certificate
- `APP_STORE_CONNECT_API_KEY_ID`: Key ID from App Store Connect
- `APP_STORE_CONNECT_API_ISSUER_ID`: Issuer ID from App Store Connect
- `APP_STORE_CONNECT_API_KEY_BASE64`: Base64 encoded .p8 API key file

## 🔧 Testing Your Setup

### Manual Test

1. **Test Android Build**:
   ```bash
   cd frontend
   npm run build:mobile
   npx cap sync android
   cd android
   ./gradlew assembleRelease
   ```

2. **Test iOS Build** (macOS only):
   ```bash
   cd frontend
   npm run build:mobile
   npx cap sync ios
   cd ios
   xcodebuild -workspace App.xcworkspace -scheme App -configuration Release clean build
   ```

### CI/CD Test

1. **Push to develop branch** to trigger beta deployment
2. **Push to main branch** to trigger production deployment
3. **Use workflow dispatch** to manually trigger builds

## 🚨 Security Best Practices

### 🔒 Keystore & Certificate Security
- **Never commit** keystores or certificates to version control
- **Use different keystores** for debug and release builds
- **Back up keystores** to multiple secure locations
- **Rotate certificates** before expiration
- **Use strong passwords** and store them securely

### 🔐 Secrets Management
- **Use GitHub secrets** for CI/CD, never hardcode
- **Limit repository access** to authorized team members
- **Regularly audit** who has access to secrets
- **Rotate API keys** periodically
- **Monitor usage** of API keys and certificates

### 🛡️ Access Control
- **Enable 2FA** on all developer accounts
- **Use role-based access** (principle of least privilege)
- **Review team access** regularly
- **Separate environments** (dev/staging/production)

## 🔍 Troubleshooting

### Common Issues

1. **"Keystore not found"**:
   - Ensure keystore is base64 encoded correctly
   - Check that the keystore file isn't corrupted

2. **"Invalid certificate"**:
   - Verify certificate hasn't expired
   - Ensure provisioning profile matches certificate

3. **"API authentication failed"**:
   - Check API key permissions in App Store Connect
   - Verify key ID and issuer ID are correct

4. **"Build failed - gradle"**:
   - Check Android SDK setup
   - Verify build tools versions
   - Clear gradle cache if needed

### Getting Help

- **GitHub Actions Logs**: Check the detailed logs in Actions tab
- **Capacitor Documentation**: https://capacitorjs.com/docs
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer/
- **App Store Connect Help**: https://help.apple.com/app-store-connect/

## 📋 Secrets Checklist

Before running CI/CD, ensure all these secrets are set:

### Android ✅
- [ ] `ANDROID_KEYSTORE_BASE64`
- [ ] `ANDROID_KEY_ALIAS`
- [ ] `ANDROID_KEY_PASSWORD`
- [ ] `ANDROID_STORE_PASSWORD`
- [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

### iOS ✅
- [ ] `IOS_CERTIFICATE_BASE64`
- [ ] `IOS_PROVISIONING_PROFILE_BASE64`
- [ ] `IOS_CERTIFICATE_PASSWORD`
- [ ] `APP_STORE_CONNECT_API_KEY_ID`
- [ ] `APP_STORE_CONNECT_API_ISSUER_ID`
- [ ] `APP_STORE_CONNECT_API_KEY_BASE64`

---

**Remember**: These secrets are the keys to your app stores. Keep them secure and never share them publicly!

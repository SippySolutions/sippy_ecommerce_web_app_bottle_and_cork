@echo off
REM 🔐 Android Keystore Generation Script for Windows
REM This script generates a keystore for signing your Android app

echo 🔐 Android Keystore Generation for Universal Liquors
echo ==================================================

REM Configuration
set KEYSTORE_NAME=release-key.keystore
set KEY_ALIAS=universalliquor-key
set VALIDITY_DAYS=10000

echo.
echo 📋 Keystore Configuration:
echo Keystore Name: %KEYSTORE_NAME%
echo Key Alias: %KEY_ALIAS%
echo Validity: %VALIDITY_DAYS% days (~27 years)
echo.

REM Check if keystore already exists
if exist "%KEYSTORE_NAME%" (
    echo ⚠️  Keystore already exists!
    echo Location: %CD%\%KEYSTORE_NAME%
    echo.
    set /p REPLY="Do you want to create a new keystore? This will overwrite the existing one. (y/N): "
    if /i not "%REPLY%"=="y" (
        echo ❌ Keystore generation cancelled.
        pause
        exit /b 1
    )
    echo.
)

echo 🔑 Generating Android Keystore...
echo You will be prompted for the following information:
echo 1. Keystore password (keep this safe!)
echo 2. Key password (can be the same as keystore password)
echo 3. Your name
echo 4. Organization name
echo 5. City/locality
echo 6. State/province
echo 7. Country code (2 letters)
echo.

REM Generate keystore
keytool -genkey -v -keystore "%KEYSTORE_NAME%" -alias "%KEY_ALIAS%" -keyalg RSA -keysize 2048 -validity %VALIDITY_DAYS%

REM Check if keystore was created successfully
if exist "%KEYSTORE_NAME%" (
    echo.
    echo ✅ Keystore generated successfully!
    echo 📍 Location: %CD%\%KEYSTORE_NAME%
    echo.
    echo 🔒 IMPORTANT SECURITY NOTES:
    echo 1. Keep this keystore file safe and secure
    echo 2. Back up the keystore to multiple secure locations
    echo 3. Never share the keystore or passwords
    echo 4. If you lose this keystore, you cannot update your app
    echo 5. Store passwords in a secure password manager
    echo.
    echo 📝 Next Steps:
    echo 1. Move keystore to android\app\ directory
    echo 2. Update android\gradle.properties with keystore info
    echo 3. Add keystore details to CI/CD secrets
    echo.
    echo 🎯 Gradle Properties Template:
    echo Add these lines to android\gradle.properties:
    echo.
    echo MYAPP_RELEASE_STORE_FILE=%KEYSTORE_NAME%
    echo MYAPP_RELEASE_KEY_ALIAS=%KEY_ALIAS%
    echo MYAPP_RELEASE_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
    echo MYAPP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
    echo.
    echo 🔐 CI/CD Secrets:
    echo Add these secrets to your GitHub repository:
    echo.
    echo ANDROID_KEYSTORE_BASE64 (base64 encoded keystore file)
    echo ANDROID_KEY_ALIAS (%KEY_ALIAS%)
    echo ANDROID_KEY_PASSWORD (your key password)
    echo ANDROID_STORE_PASSWORD (your keystore password)
    echo.
    echo To encode keystore for GitHub secrets:
    echo certutil -encode %KEYSTORE_NAME% keystore-base64.txt
    echo.
) else (
    echo.
    echo ❌ Failed to generate keystore
    echo Please check the error messages above and try again.
    pause
    exit /b 1
)

pause

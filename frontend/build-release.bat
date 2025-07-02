@echo off
REM Universal Liquors - Release Build Script
echo Building Universal Liquors Release APK...
echo.

REM Set Java Home to Android Studio's JDK
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
echo Using Java: %JAVA_HOME%

REM Navigate to frontend directory
cd /d "p:\SIPPY\PROJECTS\webapp\webApp\frontend"

REM Build the web app
echo [1/3] Building web app...
call npm run build:mobile
if %ERRORLEVEL% neq 0 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)

REM Sync with Capacitor
echo [2/3] Syncing with Capacitor...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

REM Build Android release App Bundle (AAB)
echo [3/3] Building Android release App Bundle...
cd android
call gradlew.bat bundleRelease
if %ERRORLEVEL% neq 0 (
    echo ERROR: Android build failed!
    pause
    exit /b 1
)

echo.
echo ✅ SUCCESS! Release App Bundle built successfully.
echo.
echo AAB Location: android\app\build\outputs\bundle\release\app-release.aab
echo.
echo Next steps:
echo 1. Test the app using the generated APK (if needed)
echo 2. Upload the AAB file to Google Play Console
echo 3. Remember: Package name is com.sippysolution.universalliquor
echo 4. Version code is now 2, increment for future releases
echo.
pause

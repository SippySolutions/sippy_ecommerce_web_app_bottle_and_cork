@echo off
echo Building Sippy E-Commerce Android App (Live Server Mode)
echo ============================================================

echo Step 1: Building mobile-optimized frontend...
call npm run build:mobile

echo Step 2: Syncing with Capacitor (Live Server Config)...
call npx cap sync

echo Step 3: Opening Android Studio...
call npx cap open android

echo ============================================================
echo Build complete! 
echo.
echo Your app is now configured to load from:
echo https://www.bottlecork.com/
echo.
echo In Android Studio:
echo 1. Build > Generate Signed Bundle/APK
echo 2. Choose Android App Bundle (AAB)
echo 3. Upload to Play Store
echo.
echo After this update, all future changes will reflect immediately!
pause

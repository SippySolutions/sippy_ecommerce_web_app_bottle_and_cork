@echo off
REM 🚀 Mobile Development Setup Script for Windows
REM This script sets up your mobile development environment

setlocal enabledelayedexpansion

echo 🚀 Universal Liquors Mobile Development Setup
echo =============================================

REM Helper function to check if command exists
where %1 >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ %1 is installed
    exit /b 0
) else (
    echo ❌ %1 is not installed
    exit /b 1
)

echo.
echo 📋 Step 1: Checking Prerequisites
echo ==================================

REM Check Node.js
call :check_command node
if errorlevel 1 (
    echo ❌ Node.js is required. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    Node.js version: %NODE_VERSION%

REM Check npm
call :check_command npm
if errorlevel 1 (
    echo ❌ npm is required
    pause
    exit /b 1
)

REM Check Java (for Android)
call :check_command java
if errorlevel 1 (
    echo ⚠️  Java is required for Android development
) else (
    for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /i version') do set JAVA_VERSION=%%i
    echo    Java version: !JAVA_VERSION!
)

REM Check Android SDK
if defined ANDROID_HOME (
    echo ✅ Android SDK found at %ANDROID_HOME%
) else if defined ANDROID_SDK_ROOT (
    echo ✅ Android SDK found at %ANDROID_SDK_ROOT%
) else (
    echo ⚠️  Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT
)

echo.
echo 📋 Step 2: Installing Dependencies
echo ==================================

echo 📦 Installing npm dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 📋 Step 3: Setting up Capacitor Platforms
echo ==========================================

REM Check if platforms already exist
if exist "android" (
    echo ⚠️  Android platform already exists
) else (
    echo 🤖 Adding Android platform...
    npx cap add android
    if errorlevel 1 (
        echo ❌ Failed to add Android platform
        pause
        exit /b 1
    )
    echo ✅ Android platform added
)

REM Note: iOS can only be added on macOS
echo ⚠️  iOS platform can only be added on macOS

echo.
echo 📋 Step 4: Building the App
echo ===========================

echo 🏗️  Building web assets...
npm run build:mobile
if errorlevel 1 (
    echo ❌ Failed to build app
    pause
    exit /b 1
)

echo 🔄 Syncing Capacitor...
npx cap sync
if errorlevel 1 (
    echo ❌ Failed to sync Capacitor
    pause
    exit /b 1
)

echo ✅ App built and synced successfully

echo.
echo 📋 Step 5: Setting up App Resources
echo ===================================

REM Create resources directory if it doesn't exist
if not exist "resources" (
    mkdir resources
    echo ✅ Resources directory created
)

REM Check for app icons
if not exist "resources\icon.png" (
    echo ⚠️  App icon not found at resources\icon.png
    echo    Please add a 1024x1024 PNG icon to resources\icon.png
)

if not exist "resources\splash.png" (
    echo ⚠️  Splash screen not found at resources\splash.png
    echo    Please add a 2732x2732 PNG splash screen to resources\splash.png
)

echo.
echo 📋 Step 6: Development Environment Setup
echo ========================================

REM Copy environment file
if not exist ".env.local" (
    if exist ".env.mobile" (
        copy ".env.mobile" ".env.local" >nul
        echo ✅ Environment file created from template
        echo ⚠️  Please update .env.local with your specific configuration
    )
)

echo.
echo 📋 Step 7: Creating Development Scripts
echo =======================================

REM Create quick development script
(
echo @echo off
echo echo 🚀 Starting mobile development...
echo.
echo REM Build and sync
echo npm run build:mobile
echo npx cap sync
echo.
echo echo Select platform to run:
echo echo 1^) Android
echo echo 2^) Open Android Studio
echo set /p choice="Enter choice (1-2): "
echo.
echo if "%%choice%%"=="1" (
echo     echo 🤖 Running on Android...
echo     npx cap run android --livereload
echo ^) else if "%%choice%%"=="2" (
echo     echo 🤖 Opening Android Studio...
echo     npx cap open android
echo ^) else (
echo     echo Invalid choice
echo ^)
echo.
echo pause
) > dev-mobile.bat

echo ✅ Development script created (dev-mobile.bat)

echo.
echo 📋 Step 8: Final Setup
echo ======================

echo 📋 Setup Summary:
echo ==================

if exist "android" (
    echo ✅ Android platform: Ready
) else (
    echo ❌ Android platform: Not available
)

echo ❌ iOS platform: Not available (requires macOS)

echo.
echo 🎯 Next Steps:
echo ==============
echo 1. Update .env.local with your configuration  
echo 2. Add app icon (resources\icon.png) and splash screen (resources\splash.png)
echo 3. Generate resources: npx @capacitor/assets generate
echo 4. Start development: dev-mobile.bat
echo 5. For Android: npx cap run android
echo.
echo 📖 Documentation:
echo =================
echo • App Store Guide: docs\APP_STORE_PUBLISHING_GUIDE.md
echo • Resources Guide: resources\README.md
echo • Capacitor Docs: https://capacitorjs.com/docs
echo.
echo 🔧 Development Commands:
echo =======================
echo • Build: npm run build:mobile
echo • Sync: npx cap sync
echo • Android: npm run android:dev
echo • Open Android Studio: npx cap open android
echo.

echo ✅ Mobile development environment setup complete! 🎉

echo.
echo 💡 Pro Tips:
echo ============
echo • Use 'npm run android:dev' for Android development with live reload
echo • Keep your keystore and certificates secure
echo • Test on real devices for best results
echo • Follow the App Store publishing guide for deployment

echo.
pause
goto :eof

:check_command
where %1 >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ %1 is installed
    exit /b 0
) else (
    echo ❌ %1 is not installed
    exit /b 1
)

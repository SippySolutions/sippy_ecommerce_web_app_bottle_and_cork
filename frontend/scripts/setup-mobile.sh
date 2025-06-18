#!/bin/bash

# 🚀 Mobile Development Setup Script
# This script sets up your mobile development environment

set -e  # Exit on any error

echo "🚀 Universal Liquors Mobile Development Setup"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "\n${BLUE}📋 Step $1: $2${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

# Check prerequisites
print_step "1" "Checking Prerequisites"

# Check Node.js
if check_command "node"; then
    NODE_VERSION=$(node --version)
    echo "   Node.js version: $NODE_VERSION"
else
    print_error "Node.js is required. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
check_command "npm" || exit 1

# Check Java (for Android)
if check_command "java"; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "   Java version: $JAVA_VERSION"
else
    print_warning "Java is required for Android development"
fi

# Check Android SDK
if [ -d "$ANDROID_HOME" ] || [ -d "$ANDROID_SDK_ROOT" ]; then
    print_success "Android SDK found"
else
    print_warning "Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT"
fi

# Check Xcode (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if check_command "xcodebuild"; then
        XCODE_VERSION=$(xcodebuild -version | head -n 1)
        echo "   Xcode version: $XCODE_VERSION"
    else
        print_warning "Xcode is required for iOS development"
    fi
fi

# Install dependencies
print_step "2" "Installing Dependencies"

echo "📦 Installing npm dependencies..."
npm install

# Add Capacitor platforms
print_step "3" "Setting up Capacitor Platforms"

# Check if platforms already exist
if [ -d "android" ]; then
    print_warning "Android platform already exists"
else
    echo "🤖 Adding Android platform..."
    npx cap add android
    print_success "Android platform added"
fi

if [ -d "ios" ]; then
    print_warning "iOS platform already exists"
else
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 Adding iOS platform..."
        npx cap add ios
        print_success "iOS platform added"
    else
        print_warning "iOS platform can only be added on macOS"
    fi
fi

# Build the app
print_step "4" "Building the App"

echo "🏗️  Building web assets..."
npm run build:mobile

echo "🔄 Syncing Capacitor..."
npx cap sync

print_success "App built and synced successfully"

# Setup resources
print_step "5" "Setting up App Resources"

# Create resources directory if it doesn't exist
if [ ! -d "resources" ]; then
    mkdir resources
    print_success "Resources directory created"
fi

# Check for app icons
if [ ! -f "resources/icon.png" ]; then
    print_warning "App icon not found at resources/icon.png"
    echo "   Please add a 1024x1024 PNG icon to resources/icon.png"
fi

if [ ! -f "resources/splash.png" ]; then
    print_warning "Splash screen not found at resources/splash.png"
    echo "   Please add a 2732x2732 PNG splash screen to resources/splash.png"
fi

# Generate resources if available
if [ -f "resources/icon.png" ] && [ -f "resources/splash.png" ]; then
    if check_command "@capacitor/assets"; then
        echo "🎨 Generating app resources..."
        npx @capacitor/assets generate
        print_success "App resources generated"
    else
        print_warning "Install @capacitor/assets to generate resources automatically"
        echo "   Run: npm install -g @capacitor/assets"
    fi
fi

# Setup development environment
print_step "6" "Development Environment Setup"

# Copy environment file
if [ ! -f ".env.local" ]; then
    if [ -f ".env.mobile" ]; then
        cp .env.mobile .env.local
        print_success "Environment file created from template"
        print_warning "Please update .env.local with your specific configuration"
    fi
fi

# Create development scripts
print_step "7" "Creating Development Scripts"

# Create quick development script
cat > dev-mobile.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting mobile development..."

# Build and sync
npm run build:mobile
npx cap sync

# Choose platform
echo "Select platform to run:"
echo "1) Android"
echo "2) iOS (macOS only)"
echo "3) Both"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🤖 Running on Android..."
        npx cap run android --livereload
        ;;
    2)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "🍎 Running on iOS..."
            npx cap run ios --livereload
        else
            echo "❌ iOS development requires macOS"
        fi
        ;;
    3)
        echo "🤖 Opening Android Studio..."
        npx cap open android &
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "🍎 Opening Xcode..."
            npx cap open ios &
        fi
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
EOF

chmod +x dev-mobile.sh
print_success "Development script created (dev-mobile.sh)"

# Final setup
print_step "8" "Final Setup"

echo "📋 Setup Summary:"
echo "=================="

if [ -d "android" ]; then
    echo "✅ Android platform: Ready"
else
    echo "❌ Android platform: Not available"
fi

if [ -d "ios" ]; then
    echo "✅ iOS platform: Ready"
else
    echo "❌ iOS platform: Not available"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Update .env.local with your configuration"
echo "2. Add app icon (resources/icon.png) and splash screen (resources/splash.png)"
echo "3. Generate resources: npx @capacitor/assets generate"
echo "4. Start development: ./dev-mobile.sh"
echo "5. For Android: npx cap run android"
echo "6. For iOS: npx cap run ios (macOS only)"
echo ""
echo "📖 Documentation:"
echo "================="
echo "• App Store Guide: docs/APP_STORE_PUBLISHING_GUIDE.md"
echo "• Resources Guide: resources/README.md"
echo "• Capacitor Docs: https://capacitorjs.com/docs"
echo ""
echo "🔧 Development Commands:"
echo "======================="
echo "• Build: npm run build:mobile"
echo "• Sync: npx cap sync"
echo "• Android: npm run android:dev"
echo "• iOS: npm run ios:dev"
echo "• Open Android Studio: npx cap open android"
echo "• Open Xcode: npx cap open ios"
echo ""

print_success "Mobile development environment setup complete! 🎉"

echo ""
echo "💡 Pro Tips:"
echo "============"
echo "• Use 'npm run android:dev' for Android development with live reload"
echo "• Use 'npm run ios:dev' for iOS development with live reload"
echo "• Keep your keystore and certificates secure"
echo "• Test on real devices for best results"
echo "• Follow the App Store publishing guide for deployment"

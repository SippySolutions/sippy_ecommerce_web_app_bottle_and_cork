// Environment Variable Validator for iOS and Mobile Apps
import { Capacitor } from '@capacitor/core';

export const validateEnvironment = () => {
  const envVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_MODE: import.meta.env.VITE_MODE,
    VITE_AUTHORIZE_NET_PUBLIC_KEY: import.meta.env.VITE_AUTHORIZE_NET_PUBLIC_KEY,
    VITE_AUTHORIZE_NET_API_LOGIN_ID: import.meta.env.VITE_AUTHORIZE_NET_API_LOGIN_ID
  };

  const platform = Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web';
  
  console.log('🔧 Environment Validation for', platform.toUpperCase());
  console.log('===============================');
  
  // Check each environment variable
  const missingVars = [];
  const loadedVars = [];
  
  Object.entries(envVars).forEach(([key, value]) => {
    if (value && value !== 'undefined') {
      loadedVars.push(key);
      // Only show first and last 4 characters for security
      const maskedValue = value.length > 8 
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : '****';
      console.log(`✅ ${key}: ${maskedValue}`);
    } else {
      missingVars.push(key);
      console.log(`❌ ${key}: NOT LOADED`);
    }
  });

  // Platform-specific validation
  if (Capacitor.isNativePlatform()) {
    console.log('📱 Native App Environment Check:');
    console.log(`   Platform: ${platform}`);
    console.log(`   Capacitor Version: ${Capacitor.VERSION || 'Unknown'}`);
    
    // Check if API base URL is accessible
    const apiBaseUrl = envVars.VITE_API_BASE_URL;
    if (apiBaseUrl && apiBaseUrl.includes('render.com')) {
      console.log('🌐 Render.com API detected - Ensure NSAppTransportSecurity is configured');
    }
  }

  // Summary
  console.log('===============================');
  console.log(`✅ Loaded: ${loadedVars.length} variables`);
  console.log(`❌ Missing: ${missingVars.length} variables`);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars);
    return false;
  }

  console.log('🎉 All environment variables loaded successfully!');
  return true;
};

// Test API connectivity
export const testAPIConnectivity = async () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!apiBaseUrl) {
    console.error('❌ No API base URL configured');
    return false;
  }

  try {
    console.log('🔗 Testing API connectivity...');
    const response = await fetch(`${apiBaseUrl}/api/cms-data`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout for mobile apps
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      console.log('✅ API connection successful');
      console.log(`   Status: ${response.status}`);
      console.log(`   URL: ${response.url}`);
      return true;
    } else {
      console.error('❌ API connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API connection error:', error.message);
    
    // iOS-specific error guidance
    if (Capacitor.getPlatform() === 'ios' && error.message.includes('network')) {
      console.error('💡 iOS Network Issue - Check NSAppTransportSecurity in Info.plist');
    }
    
    return false;
  }
};

// Export for use in app initialization
export const performStartupValidation = async () => {
  console.log('🚀 Performing startup validation...');
  
  const envValid = validateEnvironment();
  if (!envValid) {
    return false;
  }

  const apiValid = await testAPIConnectivity();
  return apiValid;
};

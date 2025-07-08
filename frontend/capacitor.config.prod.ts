import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

// Environment-specific configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const productionUrl = process.env.VITE_FRONTEND_URL || 'https://www.universalliquorsnj.com'; // Your live frontend URL

const config: CapacitorConfig = {
  appId: 'com.sippysolution.universalliquor',
  appName: 'Universal Liquors',
  webDir: 'dist',
  server: isDevelopment ? {
    // Development: Load from local
    androidScheme: 'https',
    hostname: 'localhost',
    cleartext: false
  } : {
    // Production: Load from live server
    url: productionUrl,
    androidScheme: 'https',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#ffffff',
    minWebViewVersion: 70,
    appendUserAgent: 'UniversalLiquorsApp/1.2',
    buildOptions: {
      keystorePath: './release-key.keystore',
      keystoreAlias: 'universalliquor-key',
      releaseType: 'AAB'
    }
  },
  ios: {
    backgroundColor: '#ffffff',
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
    preferredContentMode: 'mobile'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e1e1e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;

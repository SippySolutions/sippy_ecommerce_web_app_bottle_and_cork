// Mobile/Native Platform Detection Utility
import { Capacitor } from '@capacitor/core';

export const platformUtils = {
  // Check if running in native mobile app
  isNative: () => {
    return Capacitor.isNativePlatform();
  },
  
  // Check if running in iOS
  isIOS: () => {
    return Capacitor.getPlatform() === 'ios';
  },
  
  // Check if running in Android
  isAndroid: () => {
    return Capacitor.getPlatform() === 'android';
  },
  
  // Check if running in web browser
  isWeb: () => {
    return Capacitor.getPlatform() === 'web';
  },
  
  // Get current platform
  getPlatform: () => {
    return Capacitor.getPlatform();
  },
  
  // Check if mobile viewport (for responsive design)
  isMobileViewport: () => {
    return window.innerWidth <= 768;
  },
  
  // Check if we should use mobile-optimized UI
  shouldUseMobileUI: () => {
    return platformUtils.isNative() || platformUtils.isMobileViewport();
  },
  
  // Get safe area insets for iOS
  getSafeAreaInsets: () => {
    if (platformUtils.isIOS()) {
      const style = getComputedStyle(document.documentElement);
      return {
        top: style.getPropertyValue('--safe-area-inset-top') || '0px',
        bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
        left: style.getPropertyValue('--safe-area-inset-left') || '0px',
        right: style.getPropertyValue('--safe-area-inset-right') || '0px'
      };
    }
    return { top: '0px', bottom: '0px', left: '0px', right: '0px' };
  }
};

// Add CSS variables for safe area insets
if (platformUtils.isNative()) {
  document.documentElement.style.setProperty('--platform-type', 'native');
  document.documentElement.style.setProperty('--platform-name', platformUtils.getPlatform());
  document.documentElement.setAttribute('data-platform', platformUtils.getPlatform());
} else {
  document.documentElement.style.setProperty('--platform-type', 'web');
  document.documentElement.style.setProperty('--platform-name', 'web');
  document.documentElement.setAttribute('data-platform', 'web');
}

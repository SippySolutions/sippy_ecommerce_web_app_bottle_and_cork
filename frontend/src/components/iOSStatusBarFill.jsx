import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

const iOSStatusBarFill = () => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect if we're on iOS (both native app and mobile web)
    const detectIOS = () => {
      if (Capacitor.isNativePlatform()) {
        return Capacitor.getPlatform() === 'ios';
      }
      // For web browsers, detect iOS devices
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    };

    setIsIOS(detectIOS());
  }, []);

  // Only render on iOS
  if (!isIOS) {
    return null;
  }

  return (
    <div 
      className="ios-status-bar-fill"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'env(safe-area-inset-top)',
        backgroundColor: '#ffffff',
        zIndex: 999,
        // Fallback for browsers that don't support env()
        minHeight: '44px', // Standard iOS status bar height
      }}
    />
  );
};

export default iOSStatusBarFill;

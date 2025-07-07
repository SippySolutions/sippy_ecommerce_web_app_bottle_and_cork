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
        height: 'env(safe-area-inset-top, 0px)',
        backgroundColor: '#ffffff',
        zIndex: 999,
        // Only show if safe area inset is actually available
        display: 'var(--safe-area-inset-top, none)',
      }}
    />
  );
};

export default iOSStatusBarFill;

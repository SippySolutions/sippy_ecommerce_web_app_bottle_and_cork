import React, { useEffect, useState } from 'react';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

const StatusBarDebugger = () => {
  const [statusBarInfo, setStatusBarInfo] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const getStatusBarInfo = async () => {
      try {
        const platformInfo = Capacitor.getPlatform();
        const nativeInfo = Capacitor.isNativePlatform();
        setPlatform(platformInfo);
        setIsNative(nativeInfo);

        if (nativeInfo) {
          const info = await StatusBar.getInfo();
          setStatusBarInfo(info);
          console.log('StatusBar Debug Info:', {
            platform: platformInfo,
            isNative: nativeInfo,
            statusBarInfo: info
          });
        }
      } catch (error) {
        console.error('Error getting status bar info:', error);
      }
    };

    getStatusBarInfo();
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 0, 0, 0.8)',
      color: 'white',
      padding: '4px',
      fontSize: '10px',
      zIndex: 9999,
      textAlign: 'center'
    }}>
      Platform: {platform} | Native: {isNative ? 'Yes' : 'No'} | 
      Status Bar Height: {statusBarInfo?.height || 'N/A'} | 
      Overlay: {statusBarInfo?.overlays ? 'Yes' : 'No'} | 
      Android Class: {document.documentElement.classList.contains('android-status-bar') ? 'Applied' : 'Not Applied'}
    </div>
  );
};

export default StatusBarDebugger;

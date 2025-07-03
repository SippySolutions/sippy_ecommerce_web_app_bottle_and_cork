import { useEffect } from 'react';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useCMS } from '../Context/CMSContext';

const StatusBarManager = () => {
  const { cmsData, getTheme } = useCMS();
  
  useEffect(() => {
    const setupStatusBar = async () => {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('StatusBar: Not on native platform, skipping setup');
        return;
      }

      try {
        console.log('StatusBar: Setting up status bar...');
        const platform = Capacitor.getPlatform();
        console.log('StatusBar: Platform detected:', platform);
        
        // Get status bar info first
        const info = await StatusBar.getInfo();
        console.log('StatusBar: Current info:', info);
        
        // First, ensure the status bar is visible and not hidden
        await StatusBar.show();
        console.log('StatusBar: Status bar shown');
        
        const theme = getTheme();
        console.log('StatusBar: Theme data:', theme);
        
        // Platform-specific configuration
        if (platform === 'ios') {
          // iOS: Disable overlay to prevent gap, set solid white background
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          await StatusBar.setStyle({ style: 'LIGHT' }); // LIGHT = white text on colored background
          console.log('StatusBar: iOS configuration applied - no overlay with solid white background');
          
          // Verify the configuration
          const finalInfo = await StatusBar.getInfo();
          console.log('StatusBar: Final iOS configuration:', finalInfo);
        } else if (platform === 'android') {
          // Android: Keep existing configuration
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          await StatusBar.setStyle({ style: 'LIGHT' }); // LIGHT = white text on colored background
          console.log('StatusBar: Android configuration applied');
        }
        
        console.log('StatusBar: Configuration complete!');
      } catch (error) {
        console.error('StatusBar: Error setting up status bar:', error);
      }
    };

    // Setup status bar immediately when component mounts
    setupStatusBar();
  }, [cmsData, getTheme]);

  // This component doesn't render anything
  return null;
};

export default StatusBarManager;

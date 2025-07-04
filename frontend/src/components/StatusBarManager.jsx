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
        
        // Add capacitor-app class to enable Capacitor-specific CSS
        if (Capacitor.isNativePlatform()) {
          document.documentElement.classList.add('capacitor-app');
          console.log('StatusBar: Added capacitor-app class for native platform');
        }
        
        // Get status bar info first
        const info = await StatusBar.getInfo();
        console.log('StatusBar: Current info:', info);
        
        // First, ensure the status bar is visible and not hidden
        await StatusBar.show();
        console.log('StatusBar: Status bar shown');
        
        const theme = getTheme();
        console.log('StatusBar: Theme data:', theme);
        
        // Unified configuration for both iOS and Android
        // Get status bar info first
        const statusBarInfo = await StatusBar.getInfo();
        console.log('StatusBar: Status bar info:', statusBarInfo);
        
        // Calculate the status bar height for CSS
        let statusBarHeight = 0;
        
        if (platform === 'ios') {
          // iOS: Use safe area inset or default
          statusBarHeight = statusBarInfo.height || 44; // Common iOS status bar height
        } else if (platform === 'android') {
          // Android: Use reported height or default
          statusBarHeight = statusBarInfo.height || 24; // Common Android status bar height
        }
        
        // Configure status bar for both platforms
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
        await StatusBar.setStyle({ style: 'LIGHT' }); // LIGHT = dark content on light background
        
        // Force show the status bar to ensure it's visible
        await StatusBar.show();
        
        // Set unified CSS custom property for both platforms
        document.documentElement.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
        
        console.log(`StatusBar: Applied unified styling - Platform: ${platform}, Height: ${statusBarHeight}px, Background: white`);
        
        // Verify the configuration
        const finalInfo = await StatusBar.getInfo();
        console.log('StatusBar: Final configuration:', finalInfo);
        
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

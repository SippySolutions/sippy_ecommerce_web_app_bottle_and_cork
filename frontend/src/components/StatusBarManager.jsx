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
        
        // Get status bar info first
        const info = await StatusBar.getInfo();
        console.log('StatusBar: Current info:', info);
        
        // First, ensure the status bar is visible and not hidden
        await StatusBar.show();
        console.log('StatusBar: Status bar shown');
        
        const theme = getTheme();
        console.log('StatusBar: Theme data:', theme);
        
        // Convert hex color to proper format for status bar
        const statusBarColor = theme.primary || '#1E1E1E';
        console.log('StatusBar: Using color:', statusBarColor);
          // Ensure status bar is visible and overlay is disabled first
        await StatusBar.setOverlaysWebView({ overlay: false });
        console.log('StatusBar: Overlay disabled');
        
        // Set status bar background color (make it opaque, not transparent)
        await StatusBar.setBackgroundColor({ color: statusBarColor });
        console.log('StatusBar: Background color set');
        
        // Determine if we should use light or dark content based on background color
        const isDark = isColorDark(statusBarColor);
        console.log('StatusBar: Is dark background:', isDark);
        
        // Set status bar style (light content for dark backgrounds, dark content for light backgrounds)
        await StatusBar.setStyle({ 
          style: isDark ? 'LIGHT' : 'DARK' 
        });
        console.log('StatusBar: Style set to:', isDark ? 'LIGHT' : 'DARK');
        
        // Double-check that status bar is shown
        await StatusBar.show();
        
        console.log('StatusBar: Configuration complete!');
      } catch (error) {
        console.error('StatusBar: Error setting up status bar:', error);
      }
    };

    // Add a small delay to ensure the app has fully loaded
    const timer = setTimeout(() => {
      setupStatusBar();
    }, 100);

    return () => clearTimeout(timer);
  }, [cmsData, getTheme]);

  // Helper function to determine if a color is dark
  const isColorDark = (hexColor) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return true if dark (luminance < 0.5)
    return luminance < 0.5;
  };

  // This component doesn't render anything
  return null;
};

export default StatusBarManager;

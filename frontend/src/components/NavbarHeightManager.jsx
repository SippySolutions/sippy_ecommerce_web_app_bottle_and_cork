import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const NavbarHeightManager = () => {
  useEffect(() => {
    const adjustBodyPadding = () => {
      // Only run on mobile devices
      if (window.innerWidth <= 768) {
        const navbar = document.querySelector('.mobile-navbar');
        const mainContent = document.querySelector('.mobile-body-padding');
        
        if (navbar && mainContent) {
          const navbarHeight = navbar.offsetHeight;
          
          // For Capacitor apps, use safe area inset, for web use a reasonable fallback
          let safeAreaTop = 0;
          if (Capacitor.isNativePlatform()) {
            // Get actual safe area inset for native apps
            const safeAreaValue = getComputedStyle(document.documentElement)
              .getPropertyValue('--safe-area-inset-top');
            safeAreaTop = parseInt(safeAreaValue) || 0;
          } else {
            // For web, don't add extra status bar height
            safeAreaTop = 0;
          }
          
          // Calculate total top padding - avoid double counting
          const totalPadding = navbarHeight + safeAreaTop;
          mainContent.style.paddingTop = `${totalPadding}px`;
          
          console.log(`Navbar: Adjusted mobile padding to ${totalPadding}px (navbar: ${navbarHeight}px, safe area: ${safeAreaTop}px, platform: ${Capacitor.isNativePlatform() ? 'native' : 'web'})`);
        }
      }
    };

    const createAndroidStatusBarFill = () => {
      // Only create for Android native apps
      if (Capacitor.isNativePlatform() && 
          Capacitor.getPlatform() === 'android' &&
          document.documentElement.classList.contains('capacitor-app') &&
          document.documentElement.classList.contains('android-app')) {
        
        // Check if status bar fill already exists
        let statusBarFill = document.getElementById('android-status-bar-fill');
        
        if (!statusBarFill) {
          // Create status bar fill element
          statusBarFill = document.createElement('div');
          statusBarFill.id = 'android-status-bar-fill';
          statusBarFill.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 40px;
            background-color: #ffffff;
            z-index: 999;
            pointer-events: none;
          `;
          
          // Insert at the beginning of body
          document.body.insertBefore(statusBarFill, document.body.firstChild);
          console.log('NavbarHeightManager: Created Android status bar fill');
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      adjustBodyPadding();
      createAndroidStatusBarFill();
    }, 50);

    // Adjust padding on window resize (debounced)
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        adjustBodyPadding();
        createAndroidStatusBarFill();
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    
    // Adjust padding on orientation change (mobile)
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        adjustBodyPadding();
        createAndroidStatusBarFill();
      }, 200); // Longer delay for orientation change
    });

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', adjustBodyPadding);
      
      // Remove status bar fill on cleanup
      const statusBarFill = document.getElementById('android-status-bar-fill');
      if (statusBarFill) {
        statusBarFill.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default NavbarHeightManager;

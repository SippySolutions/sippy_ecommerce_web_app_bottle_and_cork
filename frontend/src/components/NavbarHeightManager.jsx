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

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(adjustBodyPadding, 50);

    // Adjust padding on window resize (debounced)
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(adjustBodyPadding, 100);
    };
    window.addEventListener('resize', handleResize);
    
    // Adjust padding on orientation change (mobile)
    window.addEventListener('orientationchange', () => {
      setTimeout(adjustBodyPadding, 200); // Longer delay for orientation change
    });

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', adjustBodyPadding);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default NavbarHeightManager;

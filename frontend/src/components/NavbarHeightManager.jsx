import { useEffect } from 'react';

const NavbarHeightManager = () => {
  useEffect(() => {
    const adjustBodyPadding = () => {
      // Only run on mobile devices
      if (window.innerWidth <= 768) {
        const navbar = document.querySelector('.mobile-navbar-ios');
        const mainContent = document.querySelector('.mobile-body-padding');
        
        if (navbar && mainContent) {
          const navbarHeight = navbar.offsetHeight;
          const safeAreaTop = getComputedStyle(document.documentElement)
            .getPropertyValue('--safe-area-inset-top') || '0px';
          
          // Calculate total top padding needed
          const totalPadding = navbarHeight + parseInt(safeAreaTop);
          mainContent.style.paddingTop = `${totalPadding}px`;
          
          console.log(`Navbar: Adjusted mobile padding to ${totalPadding}px (navbar: ${navbarHeight}px, safe area: ${safeAreaTop})`);
        }
      }
    };

    // Adjust padding on component mount
    adjustBodyPadding();

    // Adjust padding on window resize
    window.addEventListener('resize', adjustBodyPadding);
    
    // Adjust padding on orientation change (mobile)
    window.addEventListener('orientationchange', () => {
      setTimeout(adjustBodyPadding, 100); // Small delay for orientation change
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', adjustBodyPadding);
      window.removeEventListener('orientationchange', adjustBodyPadding);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default NavbarHeightManager;

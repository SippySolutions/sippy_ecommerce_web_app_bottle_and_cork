import { useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

const KeyboardManager = () => {
  useEffect(() => {
    const setupKeyboard = async () => {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      console.log('KeyboardManager: Setting up keyboard event listeners...');

      // Listen for keyboard show events
      const keyboardShowListener = Keyboard.addListener('keyboardWillShow', info => {
        console.log('KeyboardManager: Keyboard will show', info);
        
        // Only apply keyboard fixes in Capacitor apps
        if (Capacitor.isNativePlatform()) {
          // Add keyboard-open class to prevent layout shifts
          document.body.classList.add('keyboard-open');
          document.documentElement.classList.add('keyboard-open');
          
          // Find elements with mobile classes and add keyboard-open
          const mobileElements = document.querySelectorAll('.mobile-body-padding, .mobile-viewport-fix');
          mobileElements.forEach(element => {
            element.classList.add('keyboard-open');
          });
          
          // Prevent viewport from resizing by keeping fixed height
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
          }
        }
      });

      // Listen for keyboard hide events
      const keyboardHideListener = Keyboard.addListener('keyboardWillHide', () => {
        console.log('KeyboardManager: Keyboard will hide');
        
        // Only apply keyboard fixes in Capacitor apps
        if (Capacitor.isNativePlatform()) {
          // Remove keyboard-open class
          document.body.classList.remove('keyboard-open');
          document.documentElement.classList.remove('keyboard-open');
          
          // Remove from mobile elements
          const mobileElements = document.querySelectorAll('.mobile-body-padding, .mobile-viewport-fix');
          mobileElements.forEach(element => {
            element.classList.remove('keyboard-open');
          });
          
          // Restore viewport
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
          }
        }
      });

      // Cleanup function
      return () => {
        keyboardShowListener.remove();
        keyboardHideListener.remove();
      };
    };

    setupKeyboard();
  }, []);

  return null; // This component doesn't render anything
};

export default KeyboardManager;

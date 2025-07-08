import { useState, useEffect } from 'react';

const useCapacitor = () => {
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    // Check if running in Capacitor
    const capacitorCheck = !!(window.Capacitor);
    setIsCapacitor(capacitorCheck);

    // Detect platform
    if (capacitorCheck) {
      // Try to get platform info from Capacitor
      if (window.Capacitor.getPlatform) {
        setPlatform(window.Capacitor.getPlatform());
      } else {
        // Fallback detection
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('android')) {
          setPlatform('android');
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
          setPlatform('ios');
        } else {
          setPlatform('capacitor');
        }
      }
    } else {
      setPlatform('web');
    }
  }, []);

  return {
    isCapacitor,
    platform,
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isWeb: platform === 'web'
  };
};

export default useCapacitor;

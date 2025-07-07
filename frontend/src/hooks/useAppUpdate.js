import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async () => {
    // Only check in mobile app
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    setIsChecking(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/app-version`);
      const data = await response.json();
      
      const currentVersion = '1.3.0'; // You can also get this from package.json
      const hasUpdate = compareVersions(data.latestVersion, currentVersion) > 0;
      const isForced = compareVersions(data.minRequiredVersion, currentVersion) > 0;
      
      if (hasUpdate) {
        setUpdateAvailable(true);
        setUpdateInfo({
          ...data,
          isForced,
          hasUpdate
        });
      }
    } catch (error) {
      console.log('Update check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const compareVersions = (version1, version2) => {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    return 0;
  };

  const redirectToPlayStore = () => {
    const packageName = 'com.sippysolution.universalliquor';
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
    
    window.open(`market://details?id=${packageName}`, '_system') || 
    window.open(playStoreUrl, '_system');
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
    localStorage.setItem('updateDeclined', Date.now().toString());
  };

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates();
    
    // Set up periodic checks every 24 hours
    const interval = setInterval(checkForUpdates, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    updateAvailable,
    updateInfo,
    isChecking,
    checkForUpdates,
    redirectToPlayStore,
    dismissUpdate
  };
};

export default useAppUpdate;

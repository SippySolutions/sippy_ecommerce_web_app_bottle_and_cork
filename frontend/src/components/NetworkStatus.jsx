import React, { useState, useEffect } from 'react';
import { getNetworkStatus, warmupAPI } from '../services/mobileApi';

const NetworkStatus = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isServerWarming, setIsServerWarming] = useState(false);

  useEffect(() => {
    const updateNetworkStatus = () => {
      const status = getNetworkStatus();
      setIsOnline(status.online);
      setNetworkInfo(status);
    };

    const handleOnline = () => {
      updateNetworkStatus();
      // Warmup API when coming back online
      handleServerWarmup();
    };

    const handleOffline = () => {
      updateNetworkStatus();
    };

    // Initial check
    updateNetworkStatus();

    // Listen for network changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Warmup API on app start
    handleServerWarmup();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleServerWarmup = async () => {
    setIsServerWarming(true);
    try {
      await warmupAPI();
    } catch (error) {
      console.log('API warmup completed with errors');
    } finally {
      setIsServerWarming(false);
    }
  };

  // Show offline message
  if (!isOnline) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Internet Connection</h2>
            <p className="text-gray-600 mb-4">
              Please check your internet connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show server warming message
  if (isServerWarming) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Getting Ready...</h2>
            <p className="text-gray-600 mb-4">
              We're preparing everything for you. This will just take a moment.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show connection quality indicator for mobile
  const getConnectionQuality = () => {
    if (!networkInfo?.effectiveType) return null;
    
    const quality = networkInfo.effectiveType;
    let color = 'bg-green-500';
    let text = 'Excellent';
    
    if (quality === 'slow-2g' || quality === '2g') {
      color = 'bg-red-500';
      text = 'Slow';
    } else if (quality === '3g') {
      color = 'bg-yellow-500';
      text = 'Good';
    }
    
    return (
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-xs text-gray-600">{text}</span>
      </div>
    );
  };

  return (
    <>
      {children}
      {import.meta.env.VITE_DEBUG_MODE === 'true' && getConnectionQuality()}
    </>
  );
};

export default NetworkStatus;

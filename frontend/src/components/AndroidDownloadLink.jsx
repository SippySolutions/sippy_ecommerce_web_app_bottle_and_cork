import React from 'react';
import { Capacitor } from '@capacitor/core';

const AndroidDownloadLink = ({ 
  className = "",
  variant = "button", // "button", "badge", "text", "banner"
  size = "medium", // "small", "medium", "large"
  showIcon = true,
  customText = null
}) => {
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.sippysolution.universalliquor&pcampaignid=web_share";
  
  // Don't show download link if already in the mobile app
  if (Capacitor.isNativePlatform()) {
    return null;
  }

  const handleDownload = () => {
    window.open(playStoreUrl, '_blank');
  };

  // Button variant
  if (variant === "button") {
    const sizeClasses = {
      small: "px-3 py-2 text-sm",
      medium: "px-4 py-2 text-base",
      large: "px-6 py-3 text-lg"
    };

    return (
      <button
        onClick={handleDownload}
        className={`
          bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg
          transition-colors duration-200 flex items-center space-x-2
          ${sizeClasses[size]} ${className}
        `}
      >
        {showIcon && (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
          </svg>
        )}
        <span>{customText || "Download for Android"}</span>
      </button>
    );
  }

  // Badge variant (Google Play badge style)
  if (variant === "badge") {
    return (
      <div
        onClick={handleDownload}
        className={`
          cursor-pointer transition-transform duration-200 hover:scale-105
          ${className}
        `}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
          alt="Get it on Google Play"
          className={`
            ${size === 'small' ? 'h-12' : size === 'large' ? 'h-20' : 'h-16'}
          `}
        />
      </div>
    );
  }

  // Text variant
  if (variant === "text") {
    return (
      <a
        href={playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          text-green-600 hover:text-green-700 font-medium underline
          transition-colors duration-200 flex items-center space-x-1
          ${className}
        `}
      >
        {showIcon && (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
          </svg>
        )}
        <span>{customText || "Download Android App"}</span>
      </a>
    );
  }

  return null;
};

export default AndroidDownloadLink;

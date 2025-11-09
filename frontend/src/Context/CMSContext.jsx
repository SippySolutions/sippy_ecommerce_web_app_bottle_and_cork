import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import defaultCmsData from '../Data/cmsData';
import { convertTo12Hour } from '../utils/timeFormat';

const CMSContext = createContext();

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

export const CMSProvider = ({ children }) => {
  const [cmsData, setCmsData] = useState(defaultCmsData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Fetch CMS data from backend
  const fetchCMSData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get API base URL from environment variable
      const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api`;
      
      // Fetch CMS data from your API endpoint
      const response = await axios.get(`${API_BASE_URL}/cms-data`);
      
      if (response.data) {
        // Merge with default data to ensure all required fields exist
        const mergedData = {
          ...defaultCmsData,
          ...response.data,
          theme: {
            ...defaultCmsData.theme,
            ...response.data.theme
          },
          storeInfo: {
            ...defaultCmsData.storeInfo,
            ...response.data.storeInfo
          }
        };
        
        setCmsData(mergedData);
        
        // Apply theme colors to CSS custom properties
        applyThemeColors(mergedData.theme);
      }
    } catch (err) {
      console.error('Error fetching CMS data:', err);
      setError(err.message);
      // Use default data on error
      setCmsData(defaultCmsData);
      applyThemeColors(defaultCmsData.theme);
    } finally {
      setLoading(false);
    }
  };

  // Apply theme colors to CSS custom properties
  const applyThemeColors = (theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.primary);
      root.style.setProperty('--color-secondary', theme.secondary);
      root.style.setProperty('--color-accent', theme.accent);
      root.style.setProperty('--color-muted', theme.muted);
      root.style.setProperty('--color-background', theme.background);
      root.style.setProperty('--color-headingText', theme.headingText);
      root.style.setProperty('--color-bodyText', theme.bodyText);
      root.style.setProperty('--color-link', theme.linkText);
    }
  };

  // Refresh CMS data
  const refreshCMSData = () => {
    fetchCMSData();
  };

  // Helper functions to get specific data
  const getTheme = () => cmsData.theme;
  const getStoreInfo = () => cmsData.storeInfo;
  const getHeroSection = () => cmsData.heroSection;
  const getBanner = () => cmsData.banner;
  const getBrandBanner = () => cmsData.brandBanner || [];
  const getLogo = () => cmsData.logo;
  const getBestSellers = () => cmsData.bestSellers || [];
  const getCategories = () => cmsData.categories || [];
  const getPromoBanner = () => cmsData.promo_banner || null;

  // Store hours helper
  const getStoreHours = (day) => {
    const hours = cmsData.storeInfo?.storeHours?.[day?.toLowerCase()];
    if (!hours) return null;
    
    return {
      open: hours.open,
      close: hours.close,
      openFormatted: convertTo12Hour(hours.open),
      closeFormatted: convertTo12Hour(hours.close),
      isOpen: isStoreOpen(day, hours)
    };
  };

  // Check if store is currently open
  const isStoreOpen = (day, hours) => {
    if (!hours) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(hours.open.replace(':', ''));
    const closeTime = parseInt(hours.close.replace(':', ''));
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  // Get current store status
  const getCurrentStoreStatus = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const storeHours = getStoreHours(currentDay);
    
    return {
      isOpen: storeHours?.isOpen || false,
      todayHours: storeHours,
      day: currentDay
    };
  };

  useEffect(() => {
    fetchCMSData();
  }, []);

  const value = {
    // Data
    cmsData,
    loading,
    error,
    
    // Actions
    refreshCMSData,
    
    // Helper functions
    getTheme,
    getStoreInfo,
    getHeroSection,
    getBanner,
    getBrandBanner,
    getLogo,
    getBestSellers,
    getCategories,
    getPromoBanner,
    getStoreHours,
    getCurrentStoreStatus,
    
    // Theme utilities
    applyThemeColors
  };

  return (
    <CMSContext.Provider value={value}>
      {children}
    </CMSContext.Provider>
  );
};

export default CMSContext;

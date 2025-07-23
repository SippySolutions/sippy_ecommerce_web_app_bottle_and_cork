// Store Configuration
// Minimal configuration - most store data comes from CMS database
// Only essential connection and payment info should be in environment variables

export const storeConfig = {
  // Database Connection (REQUIRED - from environment)
  dbName: import.meta.env.VITE_STORE_DB_NAME || 'store_universal_liquors',
  
  // API Configuration (REQUIRED - from environment)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  
  // Payment Configuration (REQUIRED - from environment, store-specific)
  authorizeNet: {
    publicKey: import.meta.env.VITE_AUTHORIZE_NET_PUBLIC_KEY,
    loginId: import.meta.env.VITE_AUTHORIZE_NET_API_LOGIN_ID
  },
  
  // Everything else comes from CMS database:
  // - Store name, business name, logo
  // - Theme colors, branding
  // - Contact info, address, phone, email
  // - Store hours, social media
  // - Feature flags and settings
  // - All content and copy
  
  // Optional overrides (only if needed for development)
  mode: import.meta.env.VITE_MODE || 'development'
};

// Helper function to get store-specific page title (will be updated from CMS)
export const getPageTitle = (pageTitle = '', storeName = 'Store') => {
  return pageTitle ? `${pageTitle} | ${storeName}` : storeName;
};

// Store data will be fetched from CMS and applied dynamically
export const applyStoreBranding = (cmsData = null) => {
  if (cmsData) {
    // Apply theme color from CMS
    if (cmsData.theme?.primaryColor) {
      document.documentElement.style.setProperty('--store-primary-color', cmsData.theme.primaryColor);
    }
    
    // Update page title from CMS
    if (cmsData.storeInfo?.name) {
      document.title = getPageTitle('', cmsData.storeInfo.name);
    }
    
    // Update favicon from CMS
    if (cmsData.logo) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = cmsData.logo;
      }
    }
  }
};

console.log('🏪 Store Configuration Loaded:', {
  database: storeConfig.dbName,
  api: storeConfig.apiBaseUrl,
  note: 'Store branding and content will be loaded from CMS database'
});

export default storeConfig;

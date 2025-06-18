// Mobile App API Configuration for Render.com
import axios from 'axios';

// Mobile-specific API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://univeral-liquors-webapp-test.onrender.com/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000;
const RETRY_ATTEMPTS = parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3;
const RETRY_DELAY = parseInt(import.meta.env.VITE_API_RETRY_DELAY) || 2000;

// Detect if running in mobile app
const isMobileApp = import.meta.env.VITE_IS_MOBILE_APP === 'true' || 
                   window.location.protocol === 'capacitor:' ||
                   window.location.protocol === 'ionic:';

// Create axios instance with mobile-specific configuration
const mobileApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': isMobileApp ? 'UniversalLiquors-Mobile/1.0.0' : 'UniversalLiquors-Web/1.0.0'
  }
});

// Render.com cold start handler
const handleColdStart = async (error) => {
  if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
    console.log('🔄 API warming up (Render.com cold start detected)...');
    
    // Wait a bit for the server to warm up
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    
    return true; // Indicate retry should happen
  }
  return false;
};

// Retry logic for Render.com
const retryRequest = async (config, attempt = 1) => {
  try {
    const response = await mobileApiClient(config);
    return response;
  } catch (error) {
    if (attempt < RETRY_ATTEMPTS) {
      const shouldRetry = await handleColdStart(error);
      
      if (shouldRetry) {
        console.log(`🔄 Retrying API call (attempt ${attempt + 1}/${RETRY_ATTEMPTS})...`);
        return retryRequest(config, attempt + 1);
      }
    }
    
    throw error;
  }
};

// Enhanced request interceptor
mobileApiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add mobile app identifier
    if (isMobileApp) {
      config.headers['X-Mobile-App'] = 'true';
      config.headers['X-App-Platform'] = getPlatform();
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with retry logic
mobileApiClient.interceptors.response.use(
  (response) => {
    // Log successful API calls in debug mode
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Only clear token if we're not already on login page
      const currentUrl = window.location.pathname;
      if (currentUrl !== '/account' && currentUrl !== '/login') {
        localStorage.removeItem('token');
        
        // In mobile app, show a more user-friendly message
        if (isMobileApp) {
          // You can integrate with Capacitor's Toast plugin here
          console.log('🔐 Please log in again');
        }
      }
    }
    
    // Handle network errors and Render.com cold starts
    if (!originalRequest._retried && 
        (error.code === 'ECONNABORTED' || 
         error.response?.status >= 500 ||
         error.message?.includes('Network Error'))) {
      
      originalRequest._retried = true;
      
      try {
        return await retryRequest(originalRequest);
      } catch (retryError) {
        // Show user-friendly error for mobile
        if (isMobileApp) {
          console.error('🌐 Connection problem. Please check your internet connection.');
        }
        return Promise.reject(retryError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Platform detection
const getPlatform = () => {
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent;
    
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'ios';
    } else if (userAgent.includes('Android')) {
      return 'android';
    }
  }
  
  return 'web';
};

// API warmup function for Render.com
export const warmupAPI = async () => {
  if (import.meta.env.VITE_ENABLE_API_WARMUP === 'true') {
    try {
      console.log('🔥 Warming up API...');
      await mobileApiClient.get('/health', { timeout: 5000 });
      console.log('✅ API warmed up successfully');
    } catch (error) {
      console.log('⚠️ API warmup failed, but continuing...');
    }
  }
};

// Network status detection for mobile
export const getNetworkStatus = () => {
  if (isMobileApp && window.navigator.connection) {
    return {
      online: navigator.onLine,
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    };
  }
  
  return {
    online: navigator.onLine,
    effectiveType: 'unknown'
  };
};

// Export configured client and utilities
export {
  mobileApiClient,
  isMobileApp,
  API_BASE_URL,
  getPlatform
};

// Re-export your existing API functions with mobile enhancements
export * from './api.jsx';

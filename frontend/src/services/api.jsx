import axios from 'axios';

// Use API base URL from environment variable, fallback to localhost if not set
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api`;

// Get store database name from environment variable - REQUIRED
const STORE_DB_NAME = import.meta.env.VITE_STORE_DB_NAME;

// Check if store database name is provided
if (!STORE_DB_NAME) {
  throw new Error('VITE_STORE_DB_NAME environment variable is required');
}

// Helper to get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper to get headers with database name and auth
const getApiHeaders = () => {
  return {
    ...getAuthHeaders(),
    'X-Store-DB': STORE_DB_NAME
  };
};

// Add request interceptor to include store database header
axios.interceptors.request.use(
  (config) => {
    // Add store database header to all requests
    config.headers['X-Store-DB'] = STORE_DB_NAME;
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Enhanced logging for debugging
    if (import.meta.env.VITE_MODE === 'development') {
      console.log(`🗄️ API Request to: ${config.url} | Database: ${STORE_DB_NAME}`);
      console.log(`📋 Headers:`, config.headers);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Axios request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging for debugging
    if (import.meta.env.VITE_MODE === 'development') {
      console.error('❌ API Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.config?.headers
      });
    }
    
    // Only handle 401 errors, don't force logout on other errors
    if (error.response?.status === 401) {
      // Only clear token if it's a genuine auth failure
      const currentUrl = window.location.pathname;
      if (currentUrl !== '/account' && currentUrl !== '/login') {
        console.warn('Authentication error detected, but not forcing logout to prevent loops');
      }
    }
    return Promise.reject(error);
  }
);

export const fetchHeroSection = async () => {
  const response = await axios.get(`${API_BASE_URL}/hero-section`);
  return response.data;
};

export const fetchProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};

export const fetchfeturedProducts = async (type) => {
  if (!type) {
    throw new Error('Type parameter is required');
  }
  const response = await axios.get(`${API_BASE_URL}/featured-products/${type}`);
  return response.data;
};

export const fetchProductById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/products/${id}`);
  return response.data;
};

export const fetchDepartments = async () => {
  const response = await axios.get(`${API_BASE_URL}/departments`);
  return response.data;
};

export const fetchCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/categories`);
  return response.data;
};

export async function fetchCMSData() {
  try {
    const response = await axios.get(`${API_BASE_URL}/cms-data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return null;
  }
}

// Fetch CMS data for new CMS system
export const fetchCMSDataV2 = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cms-data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    throw error;
  }
};

export const registerUser = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Something went wrong. Please try again.';
  }
};

export const loginUser = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Something went wrong. Please try again.';
  }
};

export const fetchSimilarProducts = async (department, category, subcategory, priceRange) => {
  try {
    // Build query parameters, only include defined values
    const params = new URLSearchParams();
    params.append('department', department);
    params.append('priceRange', priceRange);
    
    if (category && category !== 'undefined') {
      params.append('category', category);
    }
    if (subcategory && subcategory !== 'undefined') {
      params.append('subcategory', subcategory);
    }

    const response = await axios.get(`${API_BASE_URL}/similar?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return { products: [] }; // Return consistent structure
  }
};

/**
 * Process Checkout
 * Sends the full checkout data (card details, billing info, shipping info, and line items) to the backend.
 * @param {Object} checkoutData - The checkout data to be sent to the backend.
 * @returns {Object} - The response from the backend.
 */
export const processCheckout = async (checkoutData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checkout/process`, checkoutData);
    return response.data;
  } catch (error) {
    console.error('Error during checkout:', error.response || error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Create a proper error object with message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An error occurred while processing the payment.';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

export const processSavedCardCheckout = async (checkoutData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checkout/process-saved-card`, checkoutData);
    return response.data;
  } catch (error) {
    console.error('Error during saved card checkout:', error.response || error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Create a proper error object with message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An error occurred while processing the payment with saved card.';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

export const processGuestCheckout = async (checkoutData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/guest/checkout`, checkoutData);
    return response.data;
  } catch (error) {
    console.error('Error during guest checkout:', error.response || error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Create a proper error object with message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An error occurred while processing the guest payment.';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

/**
 * Process Authorization - For authorization-only transactions
 * @param {Object} authorizationData - The authorization data to be sent to the backend.
 * @returns {Object} - The response from the backend.
 */
export const processAuthorization = async (authorizationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checkout/authorize`, authorizationData);
    return response.data;
  } catch (error) {
    console.error('Error during authorization:', error.response || error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Create a proper error object with message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An error occurred while processing the payment authorization.';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

export const fetchUserProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/users/me`);
  return response.data;
};

export const updateUserProfile = async (updates) => {
  const response = await axios.put(`${API_BASE_URL}/users/me`, updates);
  return response.data;
};

export const deleteUserProfile = async () => {
  const response = await axios.delete(`${API_BASE_URL}/users/me`);
  return response.data;
};

// ADDRESS
export const addAddress = async (address) => {
  const response = await axios.post(`${API_BASE_URL}/users/me/addresses`, address);
  return response.data;
};
export const updateAddress = async (addressId, address) => {
  const response = await axios.put(`${API_BASE_URL}/users/me/addresses/${addressId}`, address);
  return response.data;
};
export const deleteAddress = async (addressId) => {
  const response = await axios.delete(`${API_BASE_URL}/users/me/addresses/${addressId}`);
  return response.data;
};

// LEGACY BILLING METHODS REMOVED - USE CHECKOUT PAYMENT METHODS INSTEAD

// CHECKOUT CARD MANAGEMENT
export const addPaymentMethod = async (paymentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checkout/add-payment-method`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error adding payment method:', error.response || error);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to add payment method';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

export const deletePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/checkout/payment-method/${paymentMethodId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment method:', error.response || error);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to delete payment method';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

export const validatePaymentMethods = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checkout/validate-payment-methods`, {});
    return response.data;
  } catch (error) {
    console.error('Error validating payment methods:', error.response || error);
    throw error;
  }
};

export const syncPaymentMethods = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checkout/sync-payment-methods`, {});
    return response.data;
  } catch (error) {
    console.error('Error syncing payment methods:', error.response || error);
    throw error;
  }
};

export const getPaymentHistory = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/checkout/payment-history?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error.response || error);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to fetch payment history';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

// Fetch user orders
export const fetchUserOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders/me`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error.response || error);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to fetch orders';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

// Fetch order by ID (supports both authenticated and guest orders)
export const fetchOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error.response || error);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to fetch order details';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

// Search products
export const searchProducts = async (query, filters = {}, page = 1, limit = 20) => {
  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    });

    // Handle single-value filters
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (Array.isArray(value)) {
        // For array filters, add each value separately
        value.forEach(item => {
          params.append(key, item);
        });
      } else if (value !== undefined && value !== null && value !== '') {
        // For single-value filters
        params.set(key, value);
      }
    });

    const url = `${API_BASE_URL}/products/search?${params}`;
    console.log('🌐 API Request URL:', url);
    
    const response = await axios.get(url);
    
    console.log('✅ API Response Status:', response.status);
    console.log('📦 API Response Data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error.response || error);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to search products';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

// Get search suggestions for autocomplete
export const getSearchSuggestions = async (query, type = 'all') => {
  try {
    const params = new URLSearchParams({
      q: query,
      type
    });

    const response = await axios.get(`${API_BASE_URL}/products/search/suggestions?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error getting search suggestions:', error.response || error);    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to get search suggestions';
    
    const errorObj = new Error(errorMessage);
    errorObj.status = error.response?.status;
    errorObj.data = error.response?.data;
    throw errorObj;
  }
};

// Wishlist API functions
export const getWishlist = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/wishlist`);
    return response.data;
  } catch (error) {
    console.error('Get wishlist error:', error);
    throw error;
  }
};

export const addToWishlist = async (productId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/wishlist`, 
      { productId }
    );
    return response.data;
  } catch (error) {
    console.error('Add to wishlist error:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    throw error;
  }
};

export const clearWishlist = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/wishlist`);
    return response.data;
  } catch (error) {
    console.error('Clear wishlist error:', error);
    throw error;
  }
};

export const isInWishlist = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/wishlist/check/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Check wishlist error:', error);
    throw error;
  }
};

// Product Groups API
export const fetchProductGroups = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product-groups`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product groups:', error);
    throw error;
  }
};

export const fetchProductGroupById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product-groups/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product group:', error);
    throw error;
  }
};

export const fetchProductsByGroupId = async (id, page = 1, limit = 20, sort = 'createdAt', order = 'desc') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order
    });
    const response = await axios.get(`${API_BASE_URL}/product-groups/${id}/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by group:', error);
    throw error;
  }
};
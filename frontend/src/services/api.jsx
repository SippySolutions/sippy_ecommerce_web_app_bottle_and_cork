import axios from 'axios';

// Use API base URL from environment variable, fallback to localhost if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper to get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Auth token for request:', token ? `${token.substring(0, 20)}...` : 'No token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add response interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
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

export async function fetchCMSData() {
  try {
    const response = await fetch(`${API_BASE_URL}/cms-data`);
    if (!response.ok) {
      throw new Error('Failed to fetch CMS data');
    }
    return await response.json();
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
    const response = await fetch(
      `${API_BASE_URL}/similar?department=${department}&category=${category}&subcategory=${subcategory}&priceRange=${priceRange}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch similar products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return [];
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
    console.log('Sending checkout data to backend:', checkoutData);
    const response = await axios.post(`${API_BASE_URL}/checkout/process`, checkoutData, {
      headers: getAuthHeaders()
    });
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
    console.log('Sending saved card checkout data to backend:', checkoutData);
    const response = await axios.post(`${API_BASE_URL}/checkout/process-saved-card`, checkoutData, {
      headers: getAuthHeaders()
    });
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

export const fetchUserProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/users/me`, { headers: getAuthHeaders() });
  return response.data;
};

export const updateUserProfile = async (updates) => {
  const response = await axios.put(`${API_BASE_URL}/users/me`, updates, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteUserProfile = async () => {
  const response = await axios.delete(`${API_BASE_URL}/users/me`, { headers: getAuthHeaders() });
  return response.data;
};

// ADDRESS
export const addAddress = async (address) => {
  const response = await axios.post(`${API_BASE_URL}/users/me/addresses`, address, { headers: getAuthHeaders() });
  return response.data;
};
export const updateAddress = async (addressId, address) => {
  const response = await axios.put(`${API_BASE_URL}/users/me/addresses/${addressId}`, address, { headers: getAuthHeaders() });
  return response.data;
};
export const deleteAddress = async (addressId) => {
  const response = await axios.delete(`${API_BASE_URL}/users/me/addresses/${addressId}`, { headers: getAuthHeaders() });
  return response.data;
};

// LEGACY BILLING METHODS REMOVED - USE CHECKOUT PAYMENT METHODS INSTEAD

// CHECKOUT CARD MANAGEMENT
export const addPaymentMethod = async (paymentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checkout/add-payment-method`, paymentData, {
      headers: getAuthHeaders()
    });
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
    const response = await axios.delete(`${API_BASE_URL}/checkout/payment-method/${paymentMethodId}`, {
      headers: getAuthHeaders()
    });
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
    const response = await axios.post(`${API_BASE_URL}/checkout/validate-payment-methods`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error validating payment methods:', error.response || error);
    throw error;
  }
};

export const syncPaymentMethods = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/checkout/sync-payment-methods`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error syncing payment methods:', error.response || error);
    throw error;
  }
};

export const getPaymentHistory = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/checkout/payment-history?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
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
    const response = await axios.get(`${API_BASE_URL}/orders/me`, {
      headers: getAuthHeaders()
    });
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

// Search products
export const searchProducts = async (query, filters = {}, page = 1, limit = 20) => {
  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await axios.get(`${API_BASE_URL}/products/search?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error.response || error);
    
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

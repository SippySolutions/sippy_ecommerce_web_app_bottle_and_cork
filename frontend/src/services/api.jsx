import axios from 'axios';

// Use API base URL from environment variable, fallback to localhost if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper to get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
    console.log('Sending checkout data to backend:', checkoutData); // Debug log
    const response = await axios.post(`${API_BASE_URL}/checkout/process`, checkoutData, {
      headers: getAuthHeaders()
    });
    return response.data; // Return the response data
  } catch (error) {    console.error('Error during checkout:', error.response || error); // Debug log
    throw error.response?.data?.message || 'An error occurred while processing the payment.';
  }
};

export const processSavedCardCheckout = async (checkoutData) => {
  try {
    console.log('Sending saved card checkout data to backend:', checkoutData); // Debug log
    const response = await axios.post(`${API_BASE_URL}/checkout/process-saved-card`, checkoutData, {
      headers: getAuthHeaders()
    });
    return response.data; // Return the response data
  } catch (error) {
    console.error('Error during saved card checkout:', error.response || error); // Debug log
    throw error.response?.data?.message || 'An error occurred while processing the payment with saved card.';
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

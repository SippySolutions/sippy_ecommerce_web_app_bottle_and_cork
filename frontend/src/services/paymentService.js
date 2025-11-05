import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api`;
const STORE_DB_NAME = import.meta.env.VITE_STORE_DB_NAME;

// Simplified payment service - authorization only
// Capture, void, and refund operations are handled by the separate admin application
export class PaymentService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Add auth token and database header to requests
    this.apiClient.interceptors.request.use(
      (config) => {
        // Add store database header (REQUIRED)
        config.headers['X-Store-DB'] = STORE_DB_NAME;
        
        // Add auth token (optional for guest checkout)
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Pre-authorize payment (place hold on funds)
   * This is called when customer places an order
   * Supports both logged-in users and guest checkout
   */
  async authorizePayment(paymentData) {
    try {
      console.log('🔒 Authorizing payment:', paymentData);
      
      const response = await this.apiClient.post('/checkout/authorize', {
        ...paymentData,
        transactionType: 'auth_only' // Authorization only, no capture
      });
      
      console.log('✅ Authorization response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Authorization error:', error.response?.data || error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 400) {
        return new Error(data.message || 'Invalid payment data');
      } else if (status === 401) {
        return new Error('Authentication required');
      } else if (status === 403) {
        return new Error('Payment not authorized');
      } else if (status === 404) {
        return new Error('Payment method not found');
      } else if (status === 429) {
        return new Error('Too many requests. Please try again later.');
      } else if (status >= 500) {
        return new Error('Payment service temporarily unavailable');
      }
      
      return new Error(data.message || `Payment error: ${status}`);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'Unknown payment error');
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export individual functions for convenience
export const authorizeOrderPayment = (orderData, paymentData) => 
  paymentService.authorizePayment({ ...orderData, ...paymentData });

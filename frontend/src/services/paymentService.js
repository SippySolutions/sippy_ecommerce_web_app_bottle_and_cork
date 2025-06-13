import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Enhanced payment service with Authorize.Net integration
export class PaymentService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Add auth token to requests
    this.apiClient.interceptors.request.use(
      (config) => {
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
   * Process payment with Accept.js token
   */
  async processTokenPayment(paymentData) {
    try {
      const response = await this.apiClient.post('/checkout/process', {
        ...paymentData,
        paymentMethod: 'token'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process payment with saved card profile
   */
  async processSavedCardPayment(paymentData) {
    try {
      const response = await this.apiClient.post('/checkout/process', {
        ...paymentData,
        paymentMethod: 'profile'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process payment with direct card details (less secure)
   */
  async processDirectCardPayment(paymentData) {
    try {
      const response = await this.apiClient.post('/checkout/process', {
        ...paymentData,
        paymentMethod: 'direct'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a customer profile in Authorize.Net
   */
  async createCustomerProfile(customerData) {
    try {
      const response = await this.apiClient.post('/checkout/create-profile', customerData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add a payment method to customer profile
   */
  async addPaymentMethod(paymentData) {
    try {
      const response = await this.apiClient.post('/checkout/add-payment-method', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a payment method from customer profile
   */
  async deletePaymentMethod(customerProfileId, customerPaymentProfileId) {
    try {
      const response = await this.apiClient.delete('/checkout/delete-payment-method', {
        data: { customerProfileId, customerPaymentProfileId }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate payment methods
   */
  async validatePaymentMethods(paymentProfiles) {
    try {
      const response = await this.apiClient.post('/checkout/validate-payment-methods', {
        paymentProfiles
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory() {
    try {
      const response = await this.apiClient.get('/checkout/payment-history');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(transactionId, amount) {
    try {
      const response = await this.apiClient.post('/checkout/refund', {
        transactionId,
        amount
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get Accept.js configuration
   */
  getAcceptJsConfig() {
    return {
      publicClientKey: import.meta.env.VITE_AUTHORIZE_NET_PUBLIC_KEY,
      apiLoginId: import.meta.env.VITE_AUTHORIZE_NET_API_LOGIN_ID,
      environment: import.meta.env.VITE_AUTHORIZE_NET_ENVIRONMENT || 'sandbox'
    };
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'Payment processing failed';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network error - please check your connection and try again');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Validate credit card number (basic Luhn algorithm)
   */
  validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s+/g, '');
    
    if (!/^\d+$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return (sum % 10) === 0;
  }

  /**
   * Validate expiration date
   */
  validateExpirationDate(expirationDate) {
    const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!pattern.test(expirationDate)) {
      return false;
    }

    const [month, year] = expirationDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false;
    }

    return true;
  }

  /**
   * Detect card type from card number
   */
  detectCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\s+/g, '');
    
    if (/^4/.test(cleaned)) {
      return 'Visa';
    } else if (/^5[1-5]/.test(cleaned)) {
      return 'MasterCard';
    } else if (/^3[47]/.test(cleaned)) {
      return 'American Express';
    } else if (/^6/.test(cleaned)) {
      return 'Discover';
    } else {
      return 'Unknown';
    }
  }
}

// Create singleton instance
export const paymentService = new PaymentService();

// Export individual methods for backward compatibility
export const processTokenPayment = (data) => paymentService.processTokenPayment(data);
export const processSavedCardPayment = (data) => paymentService.processSavedCardPayment(data);
export const processDirectCardPayment = (data) => paymentService.processDirectCardPayment(data);
export const createCustomerProfile = (data) => paymentService.createCustomerProfile(data);
export const addPaymentMethod = (data) => paymentService.addPaymentMethod(data);
export const deletePaymentMethod = (profileId, paymentProfileId) => 
  paymentService.deletePaymentMethod(profileId, paymentProfileId);
export const validatePaymentMethods = (profiles) => paymentService.validatePaymentMethods(profiles);

export default paymentService;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AcceptJSForm = ({ 
  onTokenReceived, 
  onPaymentError, 
  billingAddress, 
  disabled = false,
  buttonText = "Pay Now",
  amount 
}) => {  const [loading, setLoading] = useState(false);
  const [acceptJSLoaded, setAcceptJSLoaded] = useState(false);
  const [developmentMode, setDevelopmentMode] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  // Initialize Accept.js when component mounts
  useEffect(() => {
    // Check if we're in development and not using HTTPS
    const isHttpDevelopment = import.meta.env.MODE === 'development' && !window.location.protocol.includes('https');
    
    if (isHttpDevelopment) {
      console.warn('⚠️ Accept.js requires HTTPS connection.');
      console.warn('📝 Running in development bypass mode for testing.');
      setDevelopmentMode(true);
      setAcceptJSLoaded(true); // Allow form to work in dev mode
      return;
    }

    // Check if Accept.js is already loaded
    if (window.Accept) {
      setAcceptJSLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = import.meta.env.MODE === 'production' 
      ? 'https://js.authorize.net/v1/Accept.js' 
      : 'https://jstest.authorize.net/v1/Accept.js';
    script.async = true;
    
    script.onload = () => {
      setAcceptJSLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Accept.js');
      toast.error('Payment system is temporarily unavailable');
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount as it may be used by other components
    };
  }, []);
  // Auto-fill billing info if provided
  useEffect(() => {
    if (billingAddress) {
      setFormData(prev => ({
        ...prev,
        fullName: `${billingAddress.firstName || ''} ${billingAddress.lastName || ''}`.trim(),
        address: billingAddress.address || '',
        city: billingAddress.city || '',
        state: billingAddress.state || '',
        zipCode: billingAddress.zip || ''
      }));
    }
  }, [billingAddress]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    // Format expiration date as MM/YY
    if (name === 'expirationDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2');
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptJSLoaded) {
      toast.error('Payment system is loading. Please wait...');
      return;
    }    setLoading(true);

    try {
      // Development mode bypass for HTTP testing
      if (developmentMode) {
        console.log('🧪 Development mode: Simulating payment processing');
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create mock payment token data
        const mockTokenData = {
          dataDescriptor: 'COMMON.ACCEPT.INAPP.PAYMENT',
          dataValue: 'mock_development_token_' + Date.now(),
          cardInfo: {
            cardType: detectCardType(formData.cardNumber),
            lastFour: formData.cardNumber.replace(/\s+/g, '').slice(-4),
            expiryMonth: formData.expirationDate.split('/')[0],
            expiryYear: formData.expirationDate.split('/')[1]
          }
        };
        
        console.log('🧪 Mock payment token:', mockTokenData);
        
        if (onTokenReceived) {
          onTokenReceived(mockTokenData);
        }
        
        setLoading(false);
        return;
      }

      // Validate Accept.js is loaded
      if (typeof window.Accept === 'undefined') {
        throw new Error('Accept.js library not loaded. Please refresh and try again.');
      }

      // Basic client-side validation
      if (!formData.cardNumber || formData.cardNumber.replace(/\s+/g, '').length < 13) {
        throw new Error('Please enter a valid card number');
      }
      
      if (!formData.expirationDate || formData.expirationDate.length !== 5) {
        throw new Error('Please enter a valid expiration date (MM/YY)');
      }
      
      if (!formData.securityCode || formData.securityCode.length < 3) {
        throw new Error('Please enter a valid security code');
      }      // Prepare payment data for Accept.js
      const authData = {
        clientKey: import.meta.env.VITE_AUTHORIZE_NET_PUBLIC_KEY,
        apiLoginID: import.meta.env.VITE_AUTHORIZE_NET_API_LOGIN_ID
      };

      // Validate environment variables
      if (!authData.clientKey || !authData.apiLoginID) {
        throw new Error('Payment configuration error. Please contact support.');
      }

      const [expMonth, expYear] = formData.expirationDate.split('/');
      const fullYear = expYear.length === 2 ? `20${expYear}` : expYear;

      const cardData = {
        cardNumber: formData.cardNumber.replace(/\s+/g, ''),
        month: expMonth,
        year: fullYear,
        cardCode: formData.securityCode,
        fullName: formData.fullName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        country: 'US'
      };

      // Call Accept.js to get payment nonce
      window.Accept.dispatchData({
        authData: authData,
        cardData: cardData      }, (response) => {
        if (response.messages.resultCode === "Error") {
          const errorMessages = response.messages.message || [];
          const errorMessage = errorMessages.map(msg => msg.text).join(', ') || 'Payment processing failed';
          console.error('Accept.js Error:', response);
          
          // Check for HTTPS requirement error
          const httpsError = errorMessages.find(msg => msg.code === 'E_WC_02' || msg.text.includes('HTTPS'));
          if (httpsError) {
            const httpsMessage = 'Payment processing requires a secure connection (HTTPS). Please ensure your development server is running with HTTPS enabled.';
            console.error('HTTPS Required:', httpsMessage);
            
            if (onPaymentError) {
              onPaymentError(new Error(httpsMessage));
            } else {
              toast.error(httpsMessage);
            }
          } else {
            if (onPaymentError) {
              onPaymentError(new Error(errorMessage));
            } else {
              toast.error(errorMessage);
            }
          }
          setLoading(false);
        } else {
          // Success - payment nonce received
          console.log('Accept.js Success:', response);
          
          if (onTokenReceived) {
            onTokenReceived({
              dataDescriptor: response.opaqueData.dataDescriptor,
              dataValue: response.opaqueData.dataValue,
              cardInfo: {
                cardType: detectCardType(formData.cardNumber),
                lastFour: formData.cardNumber.replace(/\s+/g, '').slice(-4),
                expiryMonth: expMonth,
                expiryYear: expYear
              }
            });
          }
          
          setLoading(false);
        }
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      
      if (onPaymentError) {
        onPaymentError(error);
      } else {
        toast.error(error.message || 'Payment processing failed');
      }
      
      setLoading(false);
    }
  };

  // Helper function to detect card type
  const detectCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s+/g, '');
    if (number.match(/^4/)) return 'Visa';
    if (number.match(/^5[1-5]/)) return 'MasterCard';
    if (number.match(/^3[47]/)) return 'American Express';
    if (number.match(/^6/)) return 'Discover';
    return 'Unknown';
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Credit Card Information</h3>
        {/* HTTPS Warning for Development */}
      {developmentMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Development Mode Active
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Running in development bypass mode. Payment processing will be simulated.
                  <br />
                  For full functionality, use: <code className="bg-blue-100 px-1 rounded">npm run dev:https</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number *
          </label>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            maxLength="19"
            required
            disabled={disabled || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Expiration and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date *
            </label>
            <input
              type="text"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleInputChange}
              placeholder="MM/YY"
              maxLength="5"
              required
              disabled={disabled || loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security Code *
            </label>
            <input
              type="password"
              name="securityCode"
              value={formData.securityCode}
              onChange={handleInputChange}
              placeholder="123"
              maxLength="4"
              required
              disabled={disabled || loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Billing Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-3">Billing Information</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={disabled || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                disabled={disabled || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  disabled={disabled || loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  maxLength="2"
                  placeholder="CA"
                  required
                  disabled={disabled || loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                maxLength="10"
                required
                disabled={disabled || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>        {/* Payment Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={disabled || loading || !acceptJSLoaded}
            className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
              disabled || loading || !acceptJSLoaded
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : !acceptJSLoaded ? (
              'Loading payment system...'
            ) : (
              `${buttonText} ${amount ? `($${amount.toFixed(2)})` : ''}`
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          🔒 Your payment information is securely processed by Authorize.Net
        </div>
      </form>
    </div>
  );
};

export default AcceptJSForm;

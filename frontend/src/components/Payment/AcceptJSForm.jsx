import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AcceptJSForm = ({ 
  onTokenReceived, 
  onPaymentError, 
  billingAddress, 
  disabled = false,
  buttonText = "Pay Now",
  amount 
}) => {
  const [loading, setLoading] = useState(false);
  const [acceptJSLoaded, setAcceptJSLoaded] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''  });
  // Production mode detection - use real Accept.js in production
  const isProduction = import.meta.env.VITE_MODE === 'production';
  const isHttps = window.location.protocol === 'https:';
  // Always use real Accept.js in production mode
  const useAcceptJS = isProduction || isHttps;
  // Initialize Accept.js when component mounts
  useEffect(() => {
    // In production mode, always use real Accept.js regardless of protocol
    if (isProduction) {
      console.log('� Production Mode: Loading real Accept.js for payment processing');
      
      // Check if Accept.js is already loaded
      if (window.Accept) {
        setAcceptJSLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.authorize.net/v1/Accept.js'; // Always production endpoint
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Accept.js loaded successfully');
        setAcceptJSLoaded(true);
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Accept.js');
        toast.error('Payment system is temporarily unavailable');
      };

      document.head.appendChild(script);
      return;
    }

    // // Development mode - require HTTPS for Accept.js
    // if (window.location.protocol === 'http:') {
    //   console.warn('⚠️ Payment processing requires HTTPS. Current URL uses HTTP.');
    //   const httpsUrl = window.location.href.replace('http://', 'https://');
    //   console.warn(`Please switch to: ${httpsUrl}`);
      
    //   // Show immediate toast warning
    //   toast.warn(
    //     <div>
    //       <p><strong>HTTPS Required for Payments</strong></p>
    //       <p style={{ fontSize: '12px', marginTop: '4px' }}>
    //         Please use: <a href={httpsUrl} style={{ color: '#3b82f6', textDecoration: 'underline' }}>{httpsUrl}</a>
    //       </p>
    //       <p style={{ fontSize: '11px', marginTop: '2px', opacity: '0.8' }}>
    //         Or restart with: npm run dev:https
    //       </p>
    //     </div>,
    //     { 
    //       autoClose: false, // Don't auto-close this important warning
    //       position: 'top-center'
    //     }
    //   );
    //   return;
    // }

    // Check if Accept.js is already loaded
    if (window.Accept) {
      setAcceptJSLoaded(true);
      return;
    }    const script = document.createElement('script');
    script.src = import.meta.env.VITE_MODE === 'production' 
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
      // Always use real Accept.js payment processing in production
      if (isProduction) {
        return handleRealPayment();
      }

      // Development mode - check HTTPS requirement
      if (!isHttps) {
        toast.error('HTTPS is required for payment processing');
        return;
      }

      // Development mode with HTTPS - use real Accept.js
      return handleRealPayment();
    } catch (error) {
      console.error('Payment processing error:', error);
      
      if (onPaymentError) {
        onPaymentError(error);
      } else {
        toast.error(error.message || 'Payment processing failed');
      }
      
      setLoading(false);
    }  };

  // Real payment handler for production Accept.js processing
  const handleRealPayment = async () => {
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
    }

    // Prepare payment data for Accept.js
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
      cardData: cardData
    }, (response) => {
      if (response.messages.resultCode === "Error") {
        const errorMessages = response.messages.message || [];
        const errorMessage = errorMessages.map(msg => msg.text).join(', ') || 'Payment processing failed';
        console.error('Accept.js Error:', response);
        
        // Check for HTTPS requirement error
        const httpsError = errorMessages.find(msg => msg.code === 'E_WC_02' || msg.text.includes('HTTPS') || msg.text.includes('secure'));
        if (httpsError) {
          const currentProtocol = window.location.protocol;
          const currentUrl = window.location.href;
          const httpsUrl = currentUrl.replace('http://', 'https://');
          
          let httpsMessage = 'Payment processing requires a secure connection (HTTPS).';
          
          if (currentProtocol === 'http:') {
            httpsMessage += ` Please use HTTPS: ${httpsUrl}`;
            console.error('HTTPS Required:', httpsMessage);
            console.log('Alternative: Restart the development server with: npm run dev:https');
            
            // Show user-friendly message with action
            toast.error(
              <div>
                <p>Secure connection required for payments.</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  Please switch to: <a href={httpsUrl} style={{ color: '#3b82f6' }}>{httpsUrl}</a>
                </p>
              </div>,
              { autoClose: 10000 }
            );
          } else {
            console.error('HTTPS Error:', httpsMessage);
            toast.error('Payment security error. Please refresh and try again.');
          }
          
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
        }        setLoading(false);
      } else {
        // Success - payment nonce received
        if (onTokenReceived) {
          onTokenReceived({
            dataDescriptor: response.opaqueData.dataDescriptor,
            dataValue: response.opaqueData.dataValue,
            cardInfo: {
              cardType: detectCardType(formData.cardNumber),
              lastFour: formData.cardNumber.replace(/\s+/g, '').slice(-4),
              expiryMonth: expMonth,
              expiryYear: expYear,
              // Include billing address for saving cards
              firstName: formData.fullName.split(' ')[0] || '',
              lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zip: formData.zipCode
            }
          });
        }
        
        setLoading(false);
      }
    });
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
      {/* Production Mode Banner */}
      {isProduction && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                � Production Mode
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Secure payment processing with Authorize.Net production servers. All transactions are real.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-4">Credit Card Information</h3>
      
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
        </div>

        {/* Payment Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={disabled || loading || !acceptJSLoaded}            className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
              disabled || loading || !acceptJSLoaded
                ? 'bg-gray-400 cursor-not-allowed' 
                : isProduction
                  ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing secure payment...
              </div>) : !acceptJSLoaded ? (
              'Loading payment system...'
            ) : (
              `${isProduction ? '� ' : ''}${buttonText} ${amount ? `($${amount.toFixed(2)})` : ''}`
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          {isProduction ? (
            '� Production Mode: Real payments processed securely by Authorize.Net'
          ) : (
            '🔒 Your payment information is securely processed by Authorize.Net'
          )}
        </div>
      </form>
    </div>
  );
};

export default AcceptJSForm;

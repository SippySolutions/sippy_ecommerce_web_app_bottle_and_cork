import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useOrderPaymentWorkflow from '../../hooks/useOrderPaymentWorkflow';
import { useCMS } from '../../Context/CMSContext'; 

const AuthorizationOnlyPaymentForm = ({ 
  onAuthorizationComplete, 
  onPaymentError, 
  billingAddress, 
  disabled = false,
  buttonText = "Authorize Payment",
  amount,
  orderData
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
    zipCode: ''
  });

  const { authorizeOrderPayment, loading: paymentLoading, error: paymentError } = useOrderPaymentWorkflow();
  const { getTheme } = useCMS();
  const theme = getTheme();
  // Production mode detection
  const isProduction = import.meta.env.VITE_MODE === 'production';
  const isHttps = window.location.protocol === 'https:';
  const useAcceptJS = isProduction && isHttps; // Only use Accept.js in production with HTTPS
  // Initialize Accept.js when component mounts
  useEffect(() => {
    if (useAcceptJS) {
      if (window.Accept) {
        setAcceptJSLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.authorize.net/v1/Accept.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Accept.js loaded successfully');
        setAcceptJSLoaded(true);
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Accept.js');
        toast.error('Payment system failed to load. Please refresh the page.');
      };

      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    } else {
      // Development mode - simulate Accept.js loading
      console.log('🧪 Development mode: Skipping Accept.js, using simulation');
      setAcceptJSLoaded(true);
    }
  }, [useAcceptJS]);

  // Initialize form with billing address
  useEffect(() => {
    if (billingAddress) {
      setFormData(prev => ({
        ...prev,
        fullName: `${billingAddress.firstName || ''} ${billingAddress.lastName || ''}`.trim(),
        address: billingAddress.address || '',
        city: billingAddress.city || '',
        state: billingAddress.state || '',
        zipCode: billingAddress.zipCode || ''
      }));
    }
  }, [billingAddress]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatExpirationDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{2,4}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 2) {
      parts.push(match.substring(i, i + 2));
    }

    if (parts.length) {
      return parts.join('/').substring(0, 5);
    } else {
      return v;
    }
  };

  const handleExpirationChange = (e) => {
    const formattedDate = formatExpirationDate(e.target.value);
    handleInputChange('expirationDate', formattedDate);
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.cardNumber || formData.cardNumber.length < 13) {
      errors.push('Please enter a valid card number');
    }

    if (!formData.expirationDate || formData.expirationDate.length < 5) {
      errors.push('Please enter a valid expiration date');
    }

    if (!formData.securityCode || formData.securityCode.length < 3) {
      errors.push('Please enter a valid security code');
    }

    if (!formData.fullName.trim()) {
      errors.push('Please enter the cardholder name');
    }

    if (errors.length > 0) {
      toast.error(errors[0]);
      return false;
    }

    return true;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (useAcceptJS && acceptJSLoaded) {
        // Real Accept.js implementation for authorization only
        await processWithAcceptJS();
      } else {
        // Development/fallback implementation
        await processDevelopmentPayment();
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Payment authorization failed. Please try again.');
      onPaymentError && onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  const processWithAcceptJS = () => {
    return new Promise((resolve, reject) => {
      const authData = {
        clientKey: import.meta.env.VITE_AUTHORIZE_NET_CLIENT_KEY,
        apiLoginID: import.meta.env.VITE_AUTHORIZE_NET_API_LOGIN_ID
      };

      const cardData = {
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        month: formData.expirationDate.split('/')[0],
        year: '20' + formData.expirationDate.split('/')[1],
        cardCode: formData.securityCode,
        fullName: formData.fullName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        country: 'US'
      };

      window.Accept.dispatchData({
        authData,
        cardData
      }, (response) => {
        if (response.messages.resultCode === 'Error') {
          const errorMessage = response.messages.message[0].text;
          reject(new Error(errorMessage));
        } else {
          // Process authorization with the token
          processAuthorization(response.opaqueData)
            .then(resolve)
            .catch(reject);
        }
      });
    });
  };
  const processAuthorization = async (opaqueData) => {
    const paymentData = {
      paymentMethod: 'token',
      dataDescriptor: opaqueData.dataDescriptor,
      dataValue: opaqueData.dataValue,
      billingAddress: {
        firstName: formData.fullName.split(' ')[0] || '',
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode
      },
      amount: amount,
      transactionType: 'auth_only', // This is key - authorization only!
      ...orderData // Include all order data
    };

    // Use the authorization workflow
    const result = await authorizeOrderPayment(orderData, paymentData);

    if (result.success) {
      toast.success('💳 Payment authorized successfully! Funds are on hold until order completion.');
      
      if (onAuthorizationComplete) {
        onAuthorizationComplete({
          success: true,
          transactionId: result.transactionId,
          authorizationCode: result.authorizationCode,
          orderId: result.order?._id,
          paymentStatus: 'authorized',
          message: 'Payment authorized - funds will be captured when order is completed'
        });
      }
    } else {
      throw new Error(result.error || 'Authorization failed');
    }
  };

  const processDevelopmentPayment = async () => {
    // Development mode simulation
    toast.info('🧪 Development Mode: Simulating payment authorization...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResult = {
      success: true,
      transactionId: `dev_auth_${Date.now()}`,
      authorizationCode: `AUTH${Math.floor(Math.random() * 1000000)}`,
      paymentStatus: 'authorized',
      message: 'Development mode: Payment authorized successfully'
    };

    toast.success('💳 Development: Payment authorized successfully!');
    
    if (onAuthorizationComplete) {
      onAuthorizationComplete(mockResult);
    }
  };

  const isFormDisabled = disabled || loading || paymentLoading || !acceptJSLoaded;
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold" style={{ color: theme.headingText }}>Payment Authorization</h3>
        <p className="text-sm mt-1" style={{ color: theme.accent }}>
          💡 We'll authorize your payment now and charge your card only when your order is ready for delivery
        </p>
      </div>

      {!acceptJSLoaded && (
        <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: theme.muted, borderColor: theme.secondary, border: '1px solid' }}>
          <p className="text-sm" style={{ color: theme.bodyText }}>Loading secure payment system...</p>
        </div>
      )}

      {paymentError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{paymentError}</p>
        </div>
      )}

      <form onSubmit={handlePaymentSubmit} className="space-y-4">        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.bodyText }}>
            Cardholder Name *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:border-transparent"
            style={{ 
              borderColor: theme.secondary,
              color: theme.bodyText,
              backgroundColor: 'white'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 2px ${theme.accent}40`;
              e.target.style.borderColor = theme.accent;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = theme.secondary;
            }}
            placeholder="John Doe"
            disabled={isFormDisabled}
            required
          />
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.bodyText }}>
            Card Number *
          </label>
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:border-transparent"
            style={{ 
              borderColor: theme.secondary,
              color: theme.bodyText,
              backgroundColor: 'white'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 2px ${theme.accent}40`;
              e.target.style.borderColor = theme.accent;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = theme.secondary;
            }}
            placeholder="1234 5678 9012 3456"
            disabled={isFormDisabled}
            maxLength="19"
            required
          />
        </div>        <div className="grid grid-cols-2 gap-4">
          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.bodyText }}>
              MM/YY *
            </label>
            <input
              type="text"
              value={formData.expirationDate}
              onChange={handleExpirationChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:border-transparent"
              style={{ 
                borderColor: theme.secondary,
                color: theme.bodyText,
                backgroundColor: 'white'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 0 2px ${theme.accent}40`;
                e.target.style.borderColor = theme.accent;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = theme.secondary;
              }}
              placeholder="12/25"
              disabled={isFormDisabled}
              maxLength="5"
              required
            />
          </div>

          {/* Security Code */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.bodyText }}>
              CVV *
            </label>
            <input
              type="text"
              value={formData.securityCode}
              onChange={(e) => handleInputChange('securityCode', e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:border-transparent"
              style={{ 
                borderColor: theme.secondary,
                color: theme.bodyText,
                backgroundColor: 'white'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 0 2px ${theme.accent}40`;
                e.target.style.borderColor = theme.accent;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = theme.secondary;
              }}
              placeholder="123"
              disabled={isFormDisabled}
              maxLength="4"
              required
            />
          </div>
        </div>        {/* Authorization Info */}
        <div className="border rounded-md p-4" style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}30` }}>
          <h4 className="font-medium mb-2" style={{ color: theme.accent }}>Authorization Process</h4>
          <ul className="text-sm space-y-1" style={{ color: theme.bodyText }}>
            <li>• We'll place a temporary hold on ${amount?.toFixed(2)} from your card</li>
            <li>• Your card will not be charged until your order is ready for delivery</li>
            <li>• You can cancel your order anytime before delivery without being charged</li>
            <li>• The authorization expires in 30 days if not captured</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isFormDisabled}
          className="w-full py-3 px-4 rounded-md font-medium transition-all duration-200 hover:transform hover:scale-[1.02]"
          style={{
            backgroundColor: isFormDisabled ? theme.muted : theme.accent,
            color: isFormDisabled ? theme.bodyText : 'white',
            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
            opacity: isFormDisabled ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isFormDisabled) {
              e.target.style.backgroundColor = `${theme.accent}dd`;
              e.target.style.boxShadow = `0 4px 12px ${theme.accent}30`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isFormDisabled) {
              e.target.style.backgroundColor = theme.accent;
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          {loading || paymentLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Authorizing Payment...</span>
            </div>
          ) : (
            buttonText
          )}
        </button>
      </form>      {/* Security Notice */}
      <div className="mt-4 text-xs text-center" style={{ color: theme.bodyText }}>
        🔒 Your payment information is encrypted and secure. We use Authorize.Net for payment processing.
      </div>
    </div>
  );
};

export default AuthorizationOnlyPaymentForm;

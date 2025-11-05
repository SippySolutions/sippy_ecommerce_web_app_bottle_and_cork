import React, { useState, useEffect } from 'react';
import { useCMS } from '../../../Context/CMSContext';

/**
 * BasePaymentForm - Shared payment form logic and UI
 * This component provides the foundation for all payment forms in the app
 * - Card input fields with validation
 * - Accept.js integration
 * - Development mode support
 * - Shared styling and theming
 */
const BasePaymentForm = ({ 
  onSubmit,
  onError,
  billingAddress,
  disabled = false,
  buttonText = "Submit Payment",
  showBillingFields = true,
  isAuthOnly = false,
  children // Allow custom fields/sections
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

  const { getTheme } = useCMS();
  const theme = getTheme();

  // Environment detection
  const isProduction = import.meta.env.VITE_MODE === 'production';
  const isHttps = window.location.protocol === 'https:';
  // Always use Accept.js - Authorize.Net handles sandbox vs production on backend
  const useAcceptJS = true;

  // Load Accept.js script
  useEffect(() => {
    // Accept.js is always required for real payment processing
    // Backend determines if using Authorize.Net sandbox or production mode

    const existingScript = document.querySelector('script[src*="accept.js"]');
    if (existingScript) {
      setAcceptJSLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.authorize.net/v1/Accept.js';
    script.async = true;
    script.charset = 'utf-8';
    
    script.onload = () => {
      console.log('✅ Accept.js loaded successfully');
      setAcceptJSLoaded(true);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Accept.js');
      onError?.(new Error('Failed to load payment processor'));
      setAcceptJSLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [useAcceptJS, onError]);

  // Auto-fill billing info
  useEffect(() => {
    if (billingAddress && showBillingFields) {
      setFormData(prev => ({
        ...prev,
        fullName: `${billingAddress.firstName || ''} ${billingAddress.lastName || ''}`.trim(),
        address: billingAddress.address || prev.address,
        city: billingAddress.city || prev.city,
        state: billingAddress.state || prev.state,
        zipCode: billingAddress.zip || prev.zipCode
      }));
    }
  }, [billingAddress, showBillingFields]);

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number (spaces every 4 digits)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiration date (MM/YY)
    if (name === 'expirationDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }

    // CVV - only numbers
    if (name === 'securityCode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Validation
  const validateForm = () => {
    const errors = [];

    // Card number validation
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean || cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      errors.push('Invalid card number');
    }

    // Expiration validation
    if (!formData.expirationDate || !/^\d{2}\/\d{2}$/.test(formData.expirationDate)) {
      errors.push('Invalid expiration date (MM/YY)');
    } else {
      const [month, year] = formData.expirationDate.split('/');
      const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expDate < new Date()) {
        errors.push('Card has expired');
      }
    }

    // CVV validation
    if (!formData.securityCode || formData.securityCode.length < 3) {
      errors.push('Invalid security code');
    }

    // Billing fields validation (if shown)
    if (showBillingFields) {
      if (!formData.fullName.trim()) errors.push('Cardholder name required');
      if (!formData.address.trim()) errors.push('Billing address required');
      if (!formData.city.trim()) errors.push('City required');
      if (!formData.state.trim()) errors.push('State required');
      if (!formData.zipCode.trim()) errors.push('ZIP code required');
    }

    return errors;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      onError?.(new Error(errors.join(', ')));
      return;
    }

    setLoading(true);

    try {
      // Always use Accept.js for real payment tokenization
      await processWithAcceptJS();
    } catch (error) {
      console.error('Payment processing error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  // Accept.js tokenization
  const processWithAcceptJS = () => {
    return new Promise((resolve, reject) => {
      if (!window.Accept) {
        reject(new Error('Accept.js not loaded'));
        return;
      }

      const [expMonth, expYear] = formData.expirationDate.split('/');
      
      const authData = {
        clientKey: import.meta.env.VITE_AUTHORIZE_NET_PUBLIC_KEY,
        apiLoginID: import.meta.env.VITE_AUTHORIZE_NET_API_LOGIN_ID
      };

      const cardData = {
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        month: expMonth,
        year: `20${expYear}`,
        cardCode: formData.securityCode,
        fullName: formData.fullName,
        zip: formData.zipCode
      };

      const secureData = { authData, cardData };

      window.Accept.dispatchData(secureData, async (response) => {
        if (response.messages.resultCode === 'Error') {
          const errorMsg = response.messages.message.map(m => m.text).join(', ');
          reject(new Error(errorMsg));
          return;
        }

        const tokenData = {
          opaqueData: response.opaqueData,
          billingInfo: showBillingFields ? {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          } : null
        };

        try {
          await onSubmit(tokenData);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  // Detect card type for icon
  const detectCardType = () => {
    const number = formData.cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return { type: 'Visa', icon: '💳' };
    if (number.startsWith('5')) return { type: 'Mastercard', icon: '💳' };
    if (number.startsWith('3')) return { type: 'Amex', icon: '💳' };
    if (number.startsWith('6')) return { type: 'Discover', icon: '💳' };
    return { type: '', icon: '💳' };
  };

  const cardInfo = detectCardType();
  const isFormDisabled = disabled || loading || !acceptJSLoaded;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Information Section */}
      <div className="bg-white p-6 rounded-lg border" style={{ borderColor: theme.secondary }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.headingText }}>
          Card Information
        </h3>

        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.bodyText }}>
              Card Number *
            </label>
            <div className="relative">
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: theme.secondary,
                  focusRing: theme.accent 
                }}
                disabled={isFormDisabled}
                required
              />
              <span className="absolute right-3 top-3 text-2xl">{cardInfo.icon}</span>
            </div>
            {cardInfo.type && (
              <p className="text-sm mt-1" style={{ color: theme.bodyText }}>
                {cardInfo.type} detected
              </p>
            )}
          </div>

          {/* Expiration and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.bodyText }}>
                Expiration Date *
              </label>
              <input
                type="text"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                maxLength="5"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: theme.secondary,
                  focusRing: theme.accent 
                }}
                disabled={isFormDisabled}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.bodyText }}>
                CVV *
              </label>
              <input
                type="text"
                name="securityCode"
                value={formData.securityCode}
                onChange={handleInputChange}
                placeholder="123"
                maxLength="4"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: theme.secondary,
                  focusRing: theme.accent 
                }}
                disabled={isFormDisabled}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Address Section */}
      {showBillingFields && (
        <div className="bg-white p-6 rounded-lg border" style={{ borderColor: theme.secondary }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.headingText }}>
            Billing Address
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.bodyText }}>
                Cardholder Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: theme.secondary,
                  focusRing: theme.accent 
                }}
                disabled={isFormDisabled}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.bodyText }}>
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: theme.secondary,
                  focusRing: theme.accent 
                }}
                disabled={isFormDisabled}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.bodyText }}>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: theme.secondary,
                    focusRing: theme.accent 
                  }}
                  disabled={isFormDisabled}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.bodyText }}>
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                  maxLength="2"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: theme.secondary,
                    focusRing: theme.accent 
                  }}
                  disabled={isFormDisabled}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.bodyText }}>
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="10001"
                maxLength="10"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: theme.secondary,
                  focusRing: theme.accent 
                }}
                disabled={isFormDisabled}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom children (for additional fields) */}
      {children}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isFormDisabled}
        className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isFormDisabled ? theme.muted : theme.accent,
          color: 'white'
        }}
        onMouseEnter={(e) => {
          if (!isFormDisabled) {
            e.target.style.opacity = '0.9';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '1';
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          buttonText
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-sm" style={{ color: theme.bodyText }}>
        <div className="flex items-center justify-center space-x-2">
          <span>🔒</span>
          <span>Secured by Authorize.Net SSL encryption</span>
        </div>
      </div>
    </form>
  );
};

export default BasePaymentForm;

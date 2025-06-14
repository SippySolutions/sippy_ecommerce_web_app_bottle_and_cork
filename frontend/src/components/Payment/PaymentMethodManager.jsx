import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../AuthContext';
import { addPaymentMethod, deletePaymentMethod, validatePaymentMethods, syncPaymentMethods, fetchUserProfile } from '../../services/api';
import AcceptJSForm from './AcceptJSForm';

const PaymentMethodManager = ({ onPaymentMethodsUpdated }) => {
  const { user, updateUser } = useContext(AuthContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  // Debug logging
  console.log('PaymentMethodManager - user:', user);
  console.log('PaymentMethodManager - user.billing:', user?.billing);
  console.log('PaymentMethodManager - paymentMethods:', paymentMethods);
  useEffect(() => {
    if (user?.billing) {
      setPaymentMethods(user.billing);
    }
  }, [user]);

  // Refresh payment methods when component mounts
  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, []);  const refreshUserData = async () => {
    try {
      // First sync payment methods with Authorize.Net to get real card details
      try {
        await syncPaymentMethods();
      } catch (syncError) {
        console.warn('Sync payment methods failed, continuing with refresh:', syncError);
      }
      
      // Then fetch updated user profile
      const userData = await fetchUserProfile();
      updateUser(userData);
      setPaymentMethods(userData.billing || []);
      if (onPaymentMethodsUpdated) {
        onPaymentMethodsUpdated(userData.billing || []);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Don't throw error to prevent logout, just log it
      if (error.response?.status === 401) {
        console.warn('Authentication error in payment methods, but not forcing logout');
      }
    }
  };
  const handleAddPaymentMethod = async (tokenData) => {
    setLoading(true);
    try {
      // Check if we're at the 3-card limit
      if (paymentMethods.length >= 3) {
        toast.error('Maximum of 3 saved cards allowed. Please delete a card first.');
        setLoading(false);
        return;
      }

      console.log('Adding payment method with token data:', tokenData);

      const paymentData = {
        dataDescriptor: tokenData.dataDescriptor,
        dataValue: tokenData.dataValue,
        billingAddress: {
          firstName: tokenData.cardInfo?.firstName || 'Customer',
          lastName: tokenData.cardInfo?.lastName || 'Name',
          address: tokenData.cardInfo?.address || '',
          city: tokenData.cardInfo?.city || '',
          state: tokenData.cardInfo?.state || '',
          zip: tokenData.cardInfo?.zip || '',
          country: 'US'
        },
        setAsDefault: paymentMethods.length === 0 // Set as default if it's the first card
      };

      console.log('Sending payment data to API:', paymentData);

      const response = await addPaymentMethod(paymentData);
      console.log('API response:', response);

      if (response.success) {
        toast.success('Payment method added successfully!');
        setShowAddForm(false);
        await refreshUserData();
      } else {
        throw new Error(response.message || 'Failed to add payment method');
      }    } catch (error) {
      console.error('Error adding payment method:', error);
      
      let errorMessage = 'Failed to add payment method';
      
      if (error.status === 400 && error.message.includes('Maximum of 3 saved cards')) {
        errorMessage = 'You can only save up to 3 payment methods. Please delete one first.';
      } else if (error.status === 401) {
        errorMessage = 'Please log in again to add payment methods.';
      } else if (error.status === 500) {
        // Check for specific duplicate payment method error
        if (error.message && error.message.includes('already saved to your account')) {
          errorMessage = 'This payment method is already saved to your account. Please use a different card or select from your existing payment methods.';
        } else if (error.message && error.message.includes('E00039')) {
          errorMessage = 'This payment method is already saved to your account. Please use a different card.';
        } else {
          errorMessage = 'Server error. Please try again later or contact support.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleDeletePaymentMethod = async (paymentMethodId) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    setLoading(true);
    try {
      console.log('Deleting payment method:', paymentMethodId);
      
      const response = await deletePaymentMethod(paymentMethodId);
      console.log('Delete response:', response);

      if (response.success) {
        toast.success('Payment method deleted successfully!');
        await refreshUserData();
      } else {
        throw new Error(response.message || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      
      let errorMessage = 'Failed to delete payment method';
      
      if (error.status === 401) {
        errorMessage = 'Please log in again to delete payment methods.';
      } else if (error.status === 404) {
        errorMessage = 'Payment method not found. It may have already been deleted.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await validatePaymentMethods();

      if (response.success) {
        if (response.invalidMethods.length > 0) {
          toast.info(`Removed ${response.invalidMethods.length} invalid payment methods`);
          await refreshUserData();
        } else {
          toast.success('All payment methods are valid');
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error validating payment methods:', error);
      toast.error(error.message || 'Failed to validate payment methods');
    } finally {
      setLoading(false);
    }
  };

  const getCardIcon = (cardType) => {
    switch (cardType?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'american express':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Saved Payment Methods ({paymentMethods.length}/3)
        </h3>        <div className="flex space-x-2">
          <button
            onClick={handleValidatePaymentMethods}
            disabled={loading || paymentMethods.length === 0}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            Validate Cards
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                await refreshUserData();
                toast.success('Payment methods synced successfully');
              } catch (error) {
                toast.error('Failed to sync payment methods');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || paymentMethods.length === 0}
            className="px-3 py-1 text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
          >
            Sync Cards
          </button>
          {paymentMethods.length < 3 && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              {showAddForm ? 'Cancel' : 'Add New Card'}
            </button>
          )}
        </div>
      </div>

      {/* 3-Card Limit Notice */}
      {paymentMethods.length >= 3 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Maximum cards reached.</strong> You can save up to 3 payment methods. 
                Delete a card to add a new one.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Form */}
      {showAddForm && paymentMethods.length < 3 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-md font-medium mb-4">Add New Payment Method</h4>
          <AcceptJSForm
            onTokenReceived={handleAddPaymentMethod}
            onPaymentError={(error) => {
              console.error('Payment form error:', error);
              toast.error(error.message || 'Payment form error');
            }}
            disabled={loading}
            buttonText="Save Payment Method"
          />
        </div>
      )}

      {/* Saved Payment Methods */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 flex items-center justify-between ${
                method.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCardIcon(method.cardType)}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {method.cardType || 'Card'} ending in {method.lastFour || '****'}
                    </span>
                    {method.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Expires: {method.expiryMonth}/{method.expiryYear}
                  </div>
                  {method.billingAddress && (
                    <div className="text-sm text-gray-500">
                      {method.billingAddress.city}, {method.billingAddress.state} {method.billingAddress.zip}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!method.isDefault && paymentMethods.length > 1 && (
                  <button
                    onClick={() => {
                      // TODO: Implement set as default functionality
                      toast.info('Set as default functionality coming soon');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  disabled={loading}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="mt-2">No saved payment methods</p>
          <p className="text-sm">Add a payment method to save it for future orders</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;

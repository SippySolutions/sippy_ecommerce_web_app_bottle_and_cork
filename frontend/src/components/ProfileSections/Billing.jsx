import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import PaymentMethodManager from '../Payment/PaymentMethodManager';

const Billing = ({ refreshUser }) => {
  const { user, updateUser } = useContext(AuthContext);

  const handlePaymentMethodsUpdated = (updatedMethods) => {
    // Update the user context with new payment methods
    const updatedUser = {
      ...user,
      billing: updatedMethods
    };
    updateUser(updatedUser);
    
    // Call the parent refresh function if provided
    if (refreshUser) {
      refreshUser();
    }
  };  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your saved payment methods for faster checkout. Maximum 3 cards allowed.
            </p>
          </div>
          <div className="hidden sm:block">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        {/* Error state for when payment functionality is not available */}
        {!user?.billing && !Array.isArray(user?.billing) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Payment Methods Not Available
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    The payment method management feature is currently experiencing issues. 
                    This may be due to server configuration or payment gateway connectivity.
                  </p>
                  <p className="mt-1">
                    Please contact support if you need to manage your saved payment methods.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <PaymentMethodManager 
          onPaymentMethodsUpdated={handlePaymentMethodsUpdated}
        />
      </div>

      {/* Security and Limit Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Secure Payment Storage
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Cards stored securely by Authorize.Net</li>
                  <li>PCI DSS compliant security</li>
                  <li>No card data on our servers</li>
                  <li>Industry-standard encryption</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Card Limit Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                Payment Method Limits
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  Maximum 3 payment methods per account. 
                  Delete existing cards to add new ones.
                </p>
                <p className="mt-1 font-semibold">
                  Current: {user?.billing?.length || 0}/3 cards saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;

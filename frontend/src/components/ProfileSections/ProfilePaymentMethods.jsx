import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../AuthContext';
import PaymentMethodManager from '../Payment/PaymentMethodManager';

const ProfilePaymentMethods = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePaymentMethodsUpdated = (updatedMethods) => {
    // Update the user context with new payment methods
    updateUser({
      ...user,
      billing: updatedMethods
    });
    
    // Force component refresh
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your saved payment methods. You can save up to 3 cards for faster checkout.
          </p>
        </div>

        <PaymentMethodManager 
          key={refreshKey}
          onPaymentMethodsUpdated={handlePaymentMethodsUpdated}
        />
      </div>

      {/* Payment Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Your Payment Information is Secure
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Card details are encrypted and stored by Authorize.Net, not on our servers</li>
                <li>We never see or store your actual card numbers</li>
                <li>All transactions use industry-standard PCI DSS security</li>
                <li>You can delete saved cards at any time</li>
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
                You can save up to 3 payment methods for faster checkout. 
                If you need to add a new card when you've reached the limit, 
                simply delete an existing one first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePaymentMethods;

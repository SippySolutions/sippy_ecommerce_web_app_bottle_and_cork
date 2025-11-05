import React from 'react';
import BasePaymentForm from './base/BasePaymentForm';

/**
 * SaveCardForm - Specialized form for saving payment methods
 * Used by PaymentMethodManager to add new cards to customer profile
 * Does NOT process transactions, only tokenizes and saves card data
 */
const SaveCardForm = ({ 
  onTokenReceived,
  onError,
  disabled = false 
}) => {
  const handleSubmit = async (tokenData) => {
    // Pass token data to parent for saving to CIM
    await onTokenReceived(tokenData);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p>
          💳 <strong>Save Payment Method:</strong> This card will be securely stored for future purchases. 
          No charge will be made at this time.
        </p>
      </div>

      <BasePaymentForm
        onSubmit={handleSubmit}
        onError={onError}
        disabled={disabled}
        buttonText="Save Payment Method"
        showBillingFields={true}
        isAuthOnly={false}
      />
    </div>
  );
};

export default SaveCardForm;

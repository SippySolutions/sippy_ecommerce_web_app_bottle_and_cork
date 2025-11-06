import React from 'react';
import BasePaymentForm from './base/BasePaymentForm';
import useOrderPaymentWorkflow from '../../hooks/useOrderPaymentWorkflow';
import { useCMS } from '../../Context/CMSContext';

/**
 * CheckoutPaymentForm - Authorization-only payment for checkout
 * Places a hold on customer's card (authorization)
 * Actual charge (capture) happens later when order is fulfilled
 * Used during checkout process for new card payments
 */
const CheckoutPaymentForm = ({ 
  onAuthorizationComplete,
  onPaymentError,
  billingAddress,
  disabled = false,
  amount,
  orderData
}) => {
  const { authorizeOrderPayment, loading: paymentLoading, error: paymentError } = useOrderPaymentWorkflow();
  const { getTheme } = useCMS();
  const theme = getTheme();

  const handleSubmit = async (tokenData) => {
    try {
      console.log('💳 Processing authorization-only payment for checkout');
      
      // Prepare payment data structure (what backend expects)
      const paymentData = {
        paymentMethod: 'token', // Backend expects 'token' for new card payments
        dataDescriptor: tokenData.opaqueData.dataDescriptor, // Flatten opaqueData
        dataValue: tokenData.opaqueData.dataValue, // Flatten opaqueData
        billingAddress: tokenData.billingInfo || billingAddress,
        amount: amount,
        transactionType: 'auth_only' // Authorization only, no capture
      };

      // Call authorization workflow with proper parameters
      // First param: orderData, Second param: paymentData
      const result = await authorizeOrderPayment(orderData, paymentData);

      if (result.success) {
        console.log('✅ Authorization successful:', result);
        onAuthorizationComplete(result);
      } else {
        throw new Error(result.message || 'Authorization failed');
      }
    } catch (error) {
      console.error('❌ Authorization error:', error);
      onPaymentError(error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Terms Agreement Required Notice */}
      {disabled && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Please scroll down and agree to the Terms & Conditions to enable payment
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                You must accept our terms before proceeding with payment
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authorization Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-800 mb-1">
              Authorization Hold
            </h4>
            <p className="text-sm text-green-700">
              We'll place a temporary hold on your card. 
              You'll only be charged when your order is prepared and ready for pickup/delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Amount Display */}
      <div className="bg-white p-4 rounded-lg border-2" style={{ borderColor: theme.accent }}>
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium" style={{ color: theme.headingText }}>
            Total Amount
          </span>
          <span className="text-2xl font-bold" style={{ color: theme.accent }}>
            ${amount?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Base Payment Form - Only disabled during payment processing */}
      <BasePaymentForm
        onSubmit={handleSubmit}
        onError={onPaymentError}
        billingAddress={billingAddress}
        disabled={paymentLoading}
        buttonText={`Authorize $${amount?.toFixed(2)}`}
        showBillingFields={true}
        isAuthOnly={true}
      >
        {/* Custom submit button that respects terms agreement */}
        {disabled && !paymentLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-yellow-800">
              ⚠️ Payment authorization disabled until you agree to Terms & Conditions below
            </p>
          </div>
        )}
      </BasePaymentForm>

      {/* Payment Error Display */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Payment Authorization Failed
              </h4>
              <p className="text-sm text-red-700">
                {paymentError.message || 'An error occurred while processing your payment'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security & Policy Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm" style={{ color: theme.bodyText }}>
        <h5 className="font-semibold mb-2" style={{ color: theme.headingText }}>
          How Authorization Works
        </h5>
        <ul className="space-y-2 list-disc list-inside">
          <li>Your card will be authorized (not charged) for ${amount?.toFixed(2)}</li>
          <li>Authorization holds typically last 7-30 days depending on your bank</li>
          <li>The actual charge will be processed when your order is ready</li>
          <li>If your order is cancelled, the authorization will be released</li>
        </ul>
      </div>
    </div>
  );
};

export default CheckoutPaymentForm;

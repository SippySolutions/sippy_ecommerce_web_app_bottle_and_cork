import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AcceptJSForm from './AcceptJSForm';
import { paymentService } from '../../services/paymentService';

const EnhancedPaymentForm = ({ 
  user, 
  amount, 
  billingInfo, 
  onPaymentSuccess, 
  onPaymentError,
  orderData,
  disabled = false 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('new'); // 'new' or 'saved'
  const [selectedCard, setSelectedCard] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  useEffect(() => {
    // If user has saved cards, default to saved payment method
    if (user?.billing && user.billing.length > 0) {
      setPaymentMethod('saved');
      const defaultCard = user.billing.find(card => card.isDefault) || user.billing[0];
      setSelectedCard(defaultCard);
    } else {
      setPaymentMethod('new');
      setShowCardForm(true);
    }
  }, [user]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'new') {
      setSelectedCard(null);
      setShowCardForm(true);
    } else {
      setShowCardForm(false);
    }
  };

  const handleCardSelection = (card) => {
    setSelectedCard(card);
  };

  const handleTokenReceived = async (tokenData) => {
    setProcessing(true);
    
    try {
      const paymentData = {
        token: tokenData.token,
        amount: amount,
        billingInfo: billingInfo,
        userId: user._id,
        cartItems: orderData.cartItems,
        orderType: orderData.orderType,
        shippingInfo: orderData.shippingInfo,
        subtotal: orderData.subtotal,
        taxAmount: orderData.taxAmount,
        tip: orderData.tip,
        bagFee: orderData.bagFee
      };

      const result = await paymentService.processTokenPayment(paymentData);
      
      if (result.success) {
        toast.success('Payment processed successfully!');
        onPaymentSuccess(result);
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment processing failed');
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSavedCardPayment = async () => {
    if (!selectedCard) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      const paymentData = {
        customerProfileId: user.authorizeNet?.customerProfileId,
        customerPaymentProfileId: selectedCard.customerPaymentProfileId,
        amount: amount,
        userId: user._id,
        cartItems: orderData.cartItems,
        orderType: orderData.orderType,
        shippingInfo: orderData.shippingInfo,
        subtotal: orderData.subtotal,
        taxAmount: orderData.taxAmount,
        tip: orderData.tip,
        bagFee: orderData.bagFee
      };

      const result = await paymentService.processSavedCardPayment(paymentData);
      
      if (result.success) {
        toast.success('Payment processed successfully!');
        onPaymentSuccess(result);
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment processing failed');
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleNewCardPayment = () => {
    setShowCardForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
        
        <div className="space-y-3">
          {/* Saved Cards Option */}
          {user?.billing && user.billing.length > 0 && (
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="saved"
                  checked={paymentMethod === 'saved'}
                  onChange={() => handlePaymentMethodChange('saved')}
                  className="text-blue-600"
                />
                <span className="font-medium">Use saved card</span>
              </label>
              
              {paymentMethod === 'saved' && (
                <div className="mt-3 ml-6 space-y-2">
                  {user.billing.map((card, index) => (
                    <label
                      key={card.customerPaymentProfileId || index}
                      className={`flex items-center space-x-3 p-3 border rounded cursor-pointer transition-colors ${
                        selectedCard?.customerPaymentProfileId === card.customerPaymentProfileId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedCard"
                        checked={selectedCard?.customerPaymentProfileId === card.customerPaymentProfileId}
                        onChange={() => handleCardSelection(card)}
                        className="text-blue-600"
                      />
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {card.cardType === 'Visa' && '💳'}
                          {card.cardType === 'MasterCard' && '💳'}
                          {card.cardType === 'American Express' && '💳'}
                          {card.cardType === 'Discover' && '💳'}
                        </span>
                        <div>
                          <div className="font-medium">
                            {card.cardType} •••• {card.lastFour}
                          </div>
                          <div className="text-sm text-gray-500">
                            Expires {card.expiryMonth}/{card.expiryYear}
                            {card.isDefault && (
                              <span className="ml-2 text-blue-600">(default)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Card Option */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="new"
              checked={paymentMethod === 'new'}
              onChange={() => handlePaymentMethodChange('new')}
              className="text-blue-600"
            />
            <span className="font-medium">Use new card</span>
          </label>
        </div>
      </div>

      {/* Payment Form */}
      {paymentMethod === 'saved' && selectedCard && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Payment Summary</h3>
            <div className="text-2xl font-bold text-green-600">
              ${amount.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💳</span>
              <div>
                <div className="font-medium">
                  {selectedCard.cardType} •••• {selectedCard.lastFour}
                </div>
                <div className="text-sm text-gray-500">
                  Expires {selectedCard.expiryMonth}/{selectedCard.expiryYear}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSavedCardPayment}
            disabled={processing || disabled}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              processing || disabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>
        </div>
      )}

      {paymentMethod === 'new' && showCardForm && (
        <AcceptJSForm
          onTokenReceived={handleTokenReceived}
          onPaymentError={onPaymentError}
          billingInfo={billingInfo}
          disabled={processing || disabled}
          buttonText="Pay Now"
          amount={amount}
        />
      )}

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <span>🔒</span>
          <span>Your payment is secured by Authorize.Net SSL encryption</span>
        </div>
        <div className="mt-1">
          We never store your complete credit card information
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentForm;

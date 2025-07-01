import { useState } from 'react';
import { paymentService } from '../services/paymentService';

/**
 * Custom hook for managing order payment authorization
 * Only handles payment authorization - capture/void/refund are handled by admin application
 */
export const useOrderPaymentWorkflow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Authorize payment when order is placed
   * This places a hold on customer's funds
   */
  const authorizeOrderPayment = async (orderData, paymentData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Starting payment authorization workflow');
      
      // Combine order data and payment data for the authorization request
      const authorizationRequest = {
        // Payment information
        ...paymentData,
        
        // Order information
        cartItems: orderData.cartItems,
        amount: orderData.cartItems.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0) + (orderData.tip || 0) + (orderData.bagFee || 0) + (orderData.deliveryFee || 0),
        shippingAddress: orderData.shippingAddress,
        billingAddress: paymentData.paymentMethod === 'saved_card' ? null : paymentData.billingAddress,
        orderType: orderData.orderType,
        scheduledDelivery: orderData.scheduledDelivery || null, // Include scheduled delivery data
        tip: orderData.tip || 0,
        bagFee: orderData.bagFee || 0,
        deliveryFee: orderData.deliveryFee || 0,
        saveCard: orderData.saveCard || false,
        ageVerified: orderData.ageVerified || false,
        ageVerifiedAt: orderData.ageVerifiedAt || null,
        guestInfo: orderData.guestInfo || null,
        customerType: orderData.customerType || 'user'
      };

      const authResult = await paymentService.authorizePayment(authorizationRequest);

      return {
        success: true,
        orderId: authResult.order?._id,
        orderNumber: authResult.order?.orderNumber,
        transactionId: authResult.transactionId,
        authorizationCode: authResult.authorizationCode,
        paymentStatus: authResult.paymentStatus || 'authorized',
        message: authResult.message
      };
    } catch (err) {
      console.error('❌ Payment authorization failed:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get order payment status
   * This can be used to check the current status of an order's payment
   */
  const getOrderPaymentStatus = (order) => {
    if (!order) return 'unknown';
      const paymentStatus = order.paymentStatus || 'pending';
    const orderStatus = order.status || 'pending';
    
    return {
      paymentStatus,
      orderStatus,
      canBeCaptured: paymentStatus === 'authorized' && orderStatus === 'delivered',
      isAuthorized: paymentStatus === 'authorized',
      isPaid: paymentStatus === 'paid' || paymentStatus === 'captured',
      isVoided: paymentStatus === 'voided',
      isPending: paymentStatus === 'pending'
    };
  };

  return {
    // Main functions
    authorizeOrderPayment,
    getOrderPaymentStatus,
    
    // State
    loading,
    error,
    
    // Helper function to clear error
    clearError: () => setError(null)
  };
};

export default useOrderPaymentWorkflow;

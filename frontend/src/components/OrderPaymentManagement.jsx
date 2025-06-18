import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PaymentStatusIndicator from './PaymentStatusIndicator';
import useOrderPaymentWorkflow from '../hooks/useOrderPaymentWorkflow';

const OrderPaymentManagement = ({ orderId, orderData, onPaymentUpdate, isStoreOwner = false }) => {
  const [order, setOrder] = useState(orderData);
  const [showActions, setShowActions] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [modificationAmount, setModificationAmount] = useState('');
  const [modificationReason, setModificationReason] = useState('');

  const {
    captureOrderPayment,
    partialCaptureOrderPayment,
    voidOrderPayment,
    handleOrderModification,
    getOrderPaymentStatus,
    loading,
    error
  } = useOrderPaymentWorkflow();

  useEffect(() => {
    if (orderData) {
      setOrder(orderData);
    }
  }, [orderData]);

  const handleCapturePayment = async () => {
    const result = await captureOrderPayment(orderId);
    
    if (result.success) {
      toast.success('💰 Payment captured successfully!');
      setOrder(prev => ({ ...prev, paymentStatus: 'captured' }));
      onPaymentUpdate && onPaymentUpdate('captured', result);
    } else {
      toast.error(`Capture failed: ${result.error}`);
    }
    
    setConfirmAction(null);
  };

  const handlePartialCapture = async () => {
    const amount = parseFloat(modificationAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const result = await partialCaptureOrderPayment(orderId, amount, modificationReason);
    
    if (result.success) {
      toast.success(`💰 Partial payment captured: $${amount.toFixed(2)}`);
      setOrder(prev => ({ ...prev, paymentStatus: 'partially_captured' }));
      onPaymentUpdate && onPaymentUpdate('partially_captured', result);
    } else {
      toast.error(`Partial capture failed: ${result.error}`);
    }
    
    setConfirmAction(null);
    setModificationAmount('');
    setModificationReason('');
  };

  const handleVoidPayment = async () => {
    const result = await voidOrderPayment(orderId, modificationReason || 'Order cancelled');
    
    if (result.success) {
      toast.success('❌ Payment authorization voided - funds released');
      setOrder(prev => ({ ...prev, paymentStatus: 'voided' }));
      onPaymentUpdate && onPaymentUpdate('voided', result);
    } else {
      toast.error(`Void failed: ${result.error}`);
    }
    
    setConfirmAction(null);
    setModificationReason('');
  };

  const getActionButtons = () => {
    const paymentStatus = order?.paymentStatus || 'pending';
    const orderStatus = order?.status || 'pending';

    if (!isStoreOwner) {
      return null;
    }

    const buttons = [];

    // Capture full payment
    if (paymentStatus === 'authorized' && orderStatus === 'completed') {
      buttons.push(
        <button
          key="capture"
          onClick={() => setConfirmAction('capture')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          disabled={loading}
        >
          💰 Capture Payment
        </button>
      );
    }

    // Partial capture (for order modifications)
    if (paymentStatus === 'authorized') {
      buttons.push(
        <button
          key="partial-capture"
          onClick={() => setConfirmAction('partial-capture')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          disabled={loading}
        >
          ⚡ Partial Capture
        </button>
      );
    }

    // Void authorization
    if (paymentStatus === 'authorized') {
      buttons.push(
        <button
          key="void"
          onClick={() => setConfirmAction('void')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          disabled={loading}
        >
          ❌ Void Authorization
        </button>
      );
    }

    return buttons;
  };

  const renderConfirmationModal = () => {
    if (!confirmAction) return null;

    const modalContent = {
      capture: {
        title: 'Capture Full Payment',
        description: `This will charge the customer's card for the full order amount of $${order?.total?.toFixed(2)}.`,
        action: handleCapturePayment,
        buttonText: 'Capture Payment',
        buttonClass: 'bg-green-600 hover:bg-green-700'
      },
      'partial-capture': {
        title: 'Partial Payment Capture',
        description: 'Capture a partial amount due to order modifications.',
        action: handlePartialCapture,
        buttonText: 'Capture Partial Payment',
        buttonClass: 'bg-blue-600 hover:bg-blue-700'
      },
      void: {
        title: 'Void Payment Authorization',
        description: 'This will cancel the payment authorization and release the hold on customer funds.',
        action: handleVoidPayment,
        buttonText: 'Void Authorization',
        buttonClass: 'bg-red-600 hover:bg-red-700'
      }
    };

    const config = modalContent[confirmAction];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 max-w-md w-full"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {config.title}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {config.description}
          </p>

          {confirmAction === 'partial-capture' && (
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capture Amount *
                </label>
                <input
                  type="number"
                  value={modificationAmount}
                  onChange={(e) => setModificationAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={order?.total || 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Partial Capture
                </label>
                <input
                  type="text"
                  value={modificationReason}
                  onChange={(e) => setModificationReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Item removed, discount applied"
                />
              </div>
            </div>
          )}

          {confirmAction === 'void' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Void
              </label>
              <input
                type="text"
                value={modificationReason}
                onChange={(e) => setModificationReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Order cancelled, out of stock"
              />
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setConfirmAction(null)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={config.action}
              className={`flex-1 text-white px-4 py-2 rounded-md font-medium transition-colors ${config.buttonClass}`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                config.buttonText
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Payment Status */}
      <PaymentStatusIndicator 
        orderId={orderId}
        orderStatus={order?.status}
        onStatusChange={(paymentDetails) => {
          setOrder(prev => ({ ...prev, paymentStatus: paymentDetails.status }));
        }}
      />

      {/* Store Owner Actions */}
      {isStoreOwner && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Payment Actions</h4>
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showActions ? 'Hide Actions' : 'Show Actions'}
            </button>
          </div>

          {showActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                {getActionButtons()}
              </div>

              {/* Payment Workflow Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h5 className="font-medium text-blue-800 mb-2">Payment Workflow Guide</h5>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Authorized:</strong> Funds are on hold, ready to capture when order is completed</p>
                  <p><strong>Capture:</strong> Actually charge the customer's card (do this when order is ready to ship)</p>
                  <p><strong>Partial Capture:</strong> Charge less than authorized amount (for order modifications)</p>
                  <p><strong>Void:</strong> Cancel authorization and release funds (for cancelled orders)</p>
                </div>
              </div>

              {/* Order Status Integration */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <h5 className="font-medium text-gray-800 mb-2">Order Status Integration</h5>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Order Status:</strong> {order?.status || 'Unknown'}</p>
                  <p><strong>Payment Status:</strong> {order?.paymentStatus || 'Unknown'}</p>
                  {order?.status === 'completed' && order?.paymentStatus === 'authorized' && (
                    <p className="text-green-600">✅ Ready to capture payment automatically</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Customer View */}
      {!isStoreOwner && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Payment Information</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>💳 Your payment method has been authorized for this order</p>
            <p>💰 You will only be charged when your order is ready for delivery</p>
            <p>🔄 You can cancel your order anytime before delivery without being charged</p>
            <p>📞 Contact us if you need to modify your order</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {renderConfirmationModal()}
    </div>
  );
};

export default OrderPaymentManagement;

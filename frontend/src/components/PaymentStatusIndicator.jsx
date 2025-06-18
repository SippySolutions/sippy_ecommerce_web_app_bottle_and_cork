import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useOrderPaymentWorkflow from '../hooks/useOrderPaymentWorkflow';

const PaymentStatusIndicator = ({ orderId, orderStatus, onStatusChange }) => {
  const { getOrderPaymentStatus, loading, error } = useOrderPaymentWorkflow();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (orderId) {
      loadPaymentStatus();
    }
  }, [orderId, refreshKey]);

  const loadPaymentStatus = async () => {
    const result = await getOrderPaymentStatus(orderId);
    if (result.success) {
      setPaymentDetails(result.paymentDetails);
      if (onStatusChange) {
        onStatusChange(result.paymentDetails);
      }
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: '⏳',
        label: 'Payment Pending',
        description: 'Waiting for payment processing'
      },
      authorized: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: '🔒',
        label: 'Payment Authorized',
        description: 'Funds are held, ready to capture when order is completed'
      },
      captured: {
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '✅',
        label: 'Payment Captured',
        description: 'Payment completed successfully'
      },
      partially_captured: {
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: '⚡',
        label: 'Partially Captured',
        description: 'Partial payment captured due to order changes'
      },
      voided: {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '❌',
        label: 'Payment Voided',
        description: 'Authorization cancelled, funds released'
      },
      refunded: {
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: '↩️',
        label: 'Payment Refunded',
        description: 'Payment has been refunded to customer'
      },
      failed: {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '⚠️',
        label: 'Payment Failed',
        description: 'Payment processing failed'
      }
    };
    
    return configs[status] || configs.pending;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getAuthorizationExpiry = (expiresAt) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `Expires in ${daysLeft} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
        <span className="text-sm text-gray-600">Loading payment status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-red-500">⚠️</span>
          <span className="text-sm text-red-700">Error loading payment status</span>
        </div>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">No payment information available</span>
      </div>
    );
  }

  const statusConfig = getStatusConfig(paymentDetails.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Main Status */}
      <div className={`p-4 rounded-lg ${statusConfig.bgColor} border-2 border-transparent hover:border-gray-200 transition-colors`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full ${statusConfig.color} flex items-center justify-center text-white font-bold text-sm`}>
              {statusConfig.icon}
            </div>
            <div>
              <h3 className={`font-semibold ${statusConfig.textColor}`}>
                {statusConfig.label}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {statusConfig.description}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh status"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-800">Payment Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Transaction ID */}
          {paymentDetails.transactionId && (
            <div>
              <span className="text-gray-500">Transaction ID:</span>
              <p className="font-mono text-gray-800">{paymentDetails.transactionId}</p>
            </div>
          )}

          {/* Amount Information */}
          <div>
            <span className="text-gray-500">Amount:</span>
            <p className="font-semibold text-gray-800">
              {formatAmount(paymentDetails.authorizedAmount || paymentDetails.amount)}
            </p>
          </div>

          {/* Authorization Date */}
          {paymentDetails.authorizedAt && (
            <div>
              <span className="text-gray-500">Authorized At:</span>
              <p className="text-gray-800">{formatDate(paymentDetails.authorizedAt)}</p>
            </div>
          )}

          {/* Capture Information */}
          {paymentDetails.capturedAmount && (
            <div>
              <span className="text-gray-500">Captured Amount:</span>
              <div>
                <p className="font-semibold text-green-600">
                  {formatAmount(paymentDetails.capturedAmount)}
                </p>
                {paymentDetails.capturedAt && (
                  <p className="text-xs text-gray-500">
                    Captured: {formatDate(paymentDetails.capturedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Remaining Amount for Partial Captures */}
          {paymentDetails.remainingAmount && paymentDetails.remainingAmount > 0 && (
            <div>
              <span className="text-gray-500">Remaining Amount:</span>
              <p className="font-semibold text-yellow-600">
                {formatAmount(paymentDetails.remainingAmount)}
              </p>
            </div>
          )}

          {/* Authorization Expiry */}
          {paymentDetails.status === 'authorized' && paymentDetails.expiresAt && (
            <div>
              <span className="text-gray-500">Authorization:</span>
              <p className="text-yellow-600">
                {getAuthorizationExpiry(paymentDetails.expiresAt)}
              </p>
            </div>
          )}
        </div>

        {/* Payment Method Info */}
        {paymentDetails.paymentMethod && (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Payment Method:</span>
            <p className="text-gray-800 text-sm">
              {paymentDetails.paymentMethod.brand || 'Card'} ending in {paymentDetails.paymentMethod.last4 || '****'}
            </p>
          </div>
        )}
      </div>

      {/* Workflow Status for Store Owners */}
      {orderStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 className="font-medium text-blue-800 mb-2">Workflow Status</h5>
          <div className="text-sm space-y-1">
            <p className="text-blue-700">
              <strong>Order Status:</strong> {orderStatus}
            </p>
            {paymentDetails.status === 'authorized' && orderStatus !== 'completed' && (
              <p className="text-blue-600">
                💡 Payment will be captured automatically when order is marked as completed
              </p>
            )}
            {paymentDetails.status === 'authorized' && orderStatus === 'completed' && (
              <p className="text-green-600">
                ✅ Ready to capture payment
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentStatusIndicator;

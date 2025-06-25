import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealTimeOrders } from '../Context/RealTimeOrderContext';
import { useNotifications } from '../Context/NotificationContext';
import { useCMS } from '../Context/CMSContext';

const CustomerOrderTracker = ({ orderId, customerId, onOrderUpdate }) => {
  const { 
    currentOrder, 
    setCurrentOrderForTracking, 
    getDeliveryInfo,
    getOrderById 
  } = useRealTimeOrders();
  
  const { isConnected, connectionError } = useNotifications();
  const { getTheme } = useCMS();
  const theme = getTheme();
  
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (orderId) {
      // Try to get order from real-time context first
      const existingOrder = getOrderById(orderId);
      if (existingOrder) {
        setCurrentOrderForTracking(existingOrder);
      }
    }

    return () => {
      // Clean up when component unmounts
      setCurrentOrderForTracking(null);
    };
  }, [orderId, getOrderById, setCurrentOrderForTracking]);

  // Update parent component when order changes
  useEffect(() => {
    if (currentOrder && onOrderUpdate) {
      onOrderUpdate(currentOrder);
    }
  }, [currentOrder, onOrderUpdate]);

  // Track order status changes
  useEffect(() => {
    if (currentOrder) {
      const newUpdate = {
        status: currentOrder.status,
        timestamp: new Date(currentOrder.updatedAt || currentOrder.createdAt),
        message: getStatusMessage(currentOrder.status, currentOrder.orderNumber)
      };

      setTrackingHistory(prev => {
        const exists = prev.some(update => 
          update.status === newUpdate.status && 
          Math.abs(new Date(update.timestamp) - new Date(newUpdate.timestamp)) < 1000
        );
        
        if (!exists) {
          setLastUpdate(newUpdate);
          return [newUpdate, ...prev].slice(0, 10); // Keep last 10 updates
        }
        
        return prev;
      });
    }
  }, [currentOrder]);

  const getStatusMessage = (status, orderNumber) => {
    const messages = {
      'new': 'Your order has been placed and is awaiting confirmation',
      'accepted': 'Great news! Your order has been accepted and is being prepared',
      'packing': 'Your order is being carefully packed',
      'ready': 'Your order is ready for pickup/delivery',
      'out_for_delivery': 'Your order is on its way to you!',
      'completed': 'Your order has been completed successfully',
      'cancelled': 'Your order has been cancelled'
    };
    
    return messages[status] || `Order status updated to ${status}`;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'new': '🆕',
      'accepted': '✅',
      'packing': '📦',
      'ready': '🚀',
      'out_for_delivery': '🚚',
      'completed': '✨',
      'cancelled': '❌'
    };
    
    return icons[status] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'accepted': 'bg-green-100 text-green-800 border-green-200',
      'packing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'ready': 'bg-purple-100 text-purple-800 border-purple-200',
      'out_for_delivery': 'bg-orange-100 text-orange-800 border-orange-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const deliveryInfo = currentOrder ? getDeliveryInfo(currentOrder._id) : null;

  if (!currentOrder) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Connection Status */}
      <div className={`px-4 py-2 text-sm ${
        isConnected 
          ? 'bg-green-50 text-green-700 border-b border-green-200' 
          : 'bg-red-50 text-red-700 border-b border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Live tracking active' : 'Connection lost'}
          </div>
          {lastUpdate && (
            <span className="text-xs">
              Last update: {lastUpdate.timestamp.toLocaleTimeString()}
            </span>
          )}
        </div>
        {connectionError && (
          <p className="text-xs mt-1 text-red-600">{connectionError}</p>
        )}
      </div>

      {/* Current Status */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{currentOrder.orderNumber}
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentOrder.status)}`}>
            <span className="mr-1">{getStatusIcon(currentOrder.status)}</span>
            {currentOrder.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </div>

        {/* Status Message */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-700 text-sm">
            {getStatusMessage(currentOrder.status, currentOrder.orderNumber)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Updated: {new Date(currentOrder.updatedAt || currentOrder.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Delivery Information */}
        {(deliveryInfo || currentOrder.orderType === 'delivery') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-blue-50 rounded-lg p-4 mb-4"
          >
            <h4 className="font-medium text-blue-900 mb-2">
              {currentOrder.orderType === 'pickup' ? 'Pickup Information' : 'Delivery Information'}
            </h4>
            {deliveryInfo?.estimatedDeliveryTime && (
              <p className="text-sm text-blue-700">
                Estimated time: {new Date(deliveryInfo.estimatedDeliveryTime).toLocaleString()}
              </p>
            )}
            {currentOrder.shippingAddress && currentOrder.orderType === 'delivery' && (
              <div className="text-sm text-blue-700 mt-2">
                <p>{currentOrder.shippingAddress.firstName} {currentOrder.shippingAddress.lastName}</p>
                <p>{currentOrder.shippingAddress.address}</p>
                <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zip}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Order Items Summary */}
        <div className="border rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Order Items ({currentOrder.items?.length || 0})
          </h4>
          <div className="space-y-2">
            {currentOrder.items?.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="flex-1 text-gray-700">{item.name}</span>
                <span className="text-gray-500">x{item.quantity}</span>
                <span className="text-gray-900 font-medium ml-2">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {currentOrder.items?.length > 3 && (
              <p className="text-sm text-gray-500">
                +{currentOrder.items.length - 3} more items
              </p>
            )}
          </div>
          <div className="border-t mt-2 pt-2">
            <div className="flex items-center justify-between font-medium">
              <span>Total:</span>
              <span>${currentOrder.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        {trackingHistory.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recent Updates</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {trackingHistory.map((update, index) => (
                  <motion.div
                    key={`${update.status}-${update.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getStatusIcon(update.status)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{update.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {update.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrderTracker;

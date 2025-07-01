import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCMS } from '../Context/CMSContext';
import { useRealTimeOrders } from '../Context/RealTimeOrderContext';
import { fetchOrderById } from '../services/api';
import InlineLoader from '../components/InlineLoader';
import CustomerOrderTracker from '../components/CustomerOrderTracker';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getTheme, cmsData } = useCMS();
  const { currentOrder, setCurrentOrderForTracking } = useRealTimeOrders();
  const theme = getTheme();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  // Update order when real-time data changes
  useEffect(() => {
    if (currentOrder && currentOrder._id === orderId) {
      setOrder(currentOrder);
      setLoading(false);
    }
  }, [currentOrder, orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!orderId || orderId.length < 20) {
        setError('Invalid order ID');
        return;
      }
      
      const response = await fetchOrderById(orderId);
      if (response.success) {
        setOrder(response.order);
        // Set up real-time tracking for this order
        setCurrentOrderForTracking(response.order);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (err) {
      console.error('Error loading order:', err);
      
      if (err.status === 404) {
        setError('Order not found. Please check your order ID.');
      } else if (err.status === 403) {
        setError('Access denied. You can only view your own orders.');
      } else if (err.status === 400) {
        setError('Invalid order ID format.');
      } else if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(err.message || 'Failed to load order details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time order updates
  const handleOrderUpdate = (updatedOrder) => {
    setOrder(updatedOrder);
    setError(''); // Clear any previous errors
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'ready_for_pickup': return 'text-purple-600 bg-purple-100';
      case 'ready_for_delivery': return 'text-purple-600 bg-purple-100';
      case 'driver_assigned': return 'text-indigo-600 bg-indigo-100';
      case 'picked_up': return 'text-orange-600 bg-orange-100';
      case 'in_transit': return 'text-orange-600 bg-orange-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'ready_for_pickup':
      case 'ready_for_delivery':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'driver_assigned':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'picked_up':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'in_transit':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  const getTrackingSteps = () => {
    const allSteps = [
      { key: 'pending', label: 'Order Placed', description: 'Your order has been placed successfully' },
      { key: 'processing', label: 'Order Processing', description: 'Your order is being prepared by the store' },
      { key: 'ready_for_pickup', label: 'Ready for Pickup', description: 'Your order is ready for pickup at the store' },
      { key: 'ready_for_delivery', label: 'Ready for Delivery', description: 'Your order is ready for delivery' },
      { key: 'driver_assigned', label: 'Driver Assigned', description: 'A driver has been assigned to deliver your order' },
      { key: 'picked_up', label: 'Picked Up by Driver', description: 'Driver has collected your order from the store' },
      { key: 'in_transit', label: order?.orderType === 'pickup' ? 'Available for Pickup' : 'In Transit', description: order?.orderType === 'pickup' ? 'Your order is available for pickup at the store' : 'Your order is on the way to you' },
      { key: 'delivered', label: order?.orderType === 'pickup' ? 'Picked Up' : 'Delivered', description: order?.orderType === 'pickup' ? 'Order has been picked up' : 'Order has been delivered successfully' }
    ];

    // Filter steps based on order type
    let relevantSteps = allSteps;
    
    if (order?.orderType === 'pickup') {
      // For pickup orders, exclude delivery-specific steps
      relevantSteps = allSteps.filter(step => 
        !['ready_for_delivery', 'driver_assigned', 'picked_up'].includes(step.key)
      );
      // Rename 'in_transit' to 'ready_for_pickup' for pickup orders
      relevantSteps = relevantSteps.map(step => {
        if (step.key === 'in_transit') {
          return { ...step, key: 'ready_for_pickup', label: 'Ready for Pickup', description: 'Your order is ready for pickup at the store' };
        }
        return step;
      });
    }

    const currentStatusIndex = relevantSteps.findIndex(step => step.key === order?.status);
    
    return relevantSteps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex && order?.status !== 'cancelled',
      current: index === currentStatusIndex && order?.status !== 'cancelled'
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <InlineLoader 
          text="Loading order details..." 
          size="large"
        />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.accent }}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const trackingSteps = getTrackingSteps();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Real-Time Order Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <CustomerOrderTracker 
            orderId={orderId}
            customerId={order?.customer}
            onOrderUpdate={handleOrderUpdate}
          />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-semibold text-sm uppercase">
                {order.status}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Order Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Progress</h2>
          
          <div className="relative">
            {trackingSteps.map((step, index) => (
              <div key={step.key} className="flex items-start mb-8 last:mb-0">
                {/* Progress Line */}
                {index < trackingSteps.length - 1 && (
                  <div 
                    className={`absolute left-4 top-8 w-0.5 h-16 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
                
                {/* Step Icon */}
                <div 
                  className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : step.current 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-current" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="ml-4 flex-1">
                  <h3 className={`font-semibold ${
                    step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </h3>
                  <p className={`text-sm ${
                    step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                  {step.current && (
                    <p className="text-sm text-blue-600 mt-1">
                      Updated {formatDate(order.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Order Type:</span>
                <span className="font-medium capitalize">{order.orderType}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">
                  {order.paymentInfo?.method === 'card' ? 'Credit Card' : 
                   order.paymentInfo?.method === 'saved_card' ? 'Saved Card' : 
                   order.paymentInfo?.method || 'Credit Card'}
                  {order.paymentInfo?.lastFour && ` ****${order.paymentInfo.lastFour}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium capitalize">
                  {order.paymentStatus || 'Completed'}
                </span>
              </div>
              
              {(order.paymentInfo?.transactionId || order.transactionId) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-sm">
                    {order.paymentInfo?.transactionId || order.transactionId}
                  </span>
                </div>
              )}
              
              {order.authorizationCode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Authorization Code:</span>
                  <span className="font-medium text-sm">{order.authorizationCode}</span>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                
                {order.tip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip:</span>
                    <span className="font-medium">${order.tip.toFixed(2)}</span>
                  </div>
                )}
                
                {order.bagFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bag Fee:</span>
                    <span className="font-medium">${order.bagFee.toFixed(2)}</span>
                  </div>
                )}
                
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium">${order.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${order.tax.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delivery/Pickup Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {order.orderType === 'delivery' ? 'Delivery Information' : 'Pickup Information'}
            </h2>
            
            {order.orderType === 'delivery' && order.shippingAddress ? (
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Store Pickup</p>
                <p className="text-gray-600">{cmsData?.storeInfo?.name || 'Universal Liquors'}</p>
                <p className="text-gray-600">{cmsData?.storeInfo?.address || 'Store Address'}</p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Pickup Hours:</strong> {cmsData?.storeInfo?.pickupHours || 'Contact store for pickup hours'}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              {order.customerType === 'guest' && order.guestInfo ? (
                <div className="space-y-2">
                  <p className="text-gray-600">Email: {order.guestInfo.email}</p>
                  <p className="text-gray-600">Phone: {order.guestInfo.phone}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-600">Registered Customer</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items ({order.items.length})</h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={item.image || '/placeholder-image.png'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </button>
          
          <button
            onClick={() => navigate('/profile?tab=orders')}
            className="flex-1 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.accent }}
          >
            View All Orders
          </button>
          
          {order.status === 'completed' && (
            <button
              onClick={() => {
                // TODO: Implement reorder functionality
                toast.info('Reorder feature coming soon!');
              }}
              className="flex-1 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: theme.primary }}
            >
              Reorder Items
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking;

import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../Context/NotificationContext';
import { useRealTimeOrders } from '../Context/RealTimeOrderContext';
import { fetchOrderById } from '../services/api';

/**
 * Custom hook for managing real-time order updates
 * @param {string} orderId - Optional order ID to track specifically
 * @param {boolean} autoTrack - Whether to automatically set up tracking for the order
 */
export const useRealTimeOrderTracking = (orderId = null, autoTrack = true) => {
  const { socket, isConnected } = useNotifications();
  const { 
    currentOrder, 
    setCurrentOrderForTracking, 
    getOrderById,
    getDeliveryInfo 
  } = useRealTimeOrders();
  
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Update connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected]);

  // Load and track specific order
  const startTracking = useCallback(async (orderIdToTrack) => {
    if (!orderIdToTrack) return;

    try {
      // First try to get from real-time context
      let order = getOrderById(orderIdToTrack);
      
      // If not found, fetch from API
      if (!order) {
        const response = await fetchOrderById(orderIdToTrack);
        if (response.success) {
          order = response.order;
        }
      }

      if (order) {
        setTrackingOrder(order);
        if (autoTrack) {
          setCurrentOrderForTracking(order);
        }
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error starting order tracking:', error);
    }
  }, [getOrderById, setCurrentOrderForTracking, autoTrack]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setTrackingOrder(null);
    if (autoTrack) {
      setCurrentOrderForTracking(null);
    }
  }, [setCurrentOrderForTracking, autoTrack]);

  // Update tracking order when current order changes
  useEffect(() => {
    if (currentOrder && (!trackingOrder || currentOrder._id === trackingOrder._id)) {
      setTrackingOrder(currentOrder);
      setLastUpdate(new Date());
    }
  }, [currentOrder, trackingOrder]);

  // Auto-start tracking if orderId is provided
  useEffect(() => {
    if (orderId && autoTrack) {
      startTracking(orderId);
    }

    return () => {
      if (autoTrack) {
        stopTracking();
      }
    };
  }, [orderId, autoTrack, startTracking, stopTracking]);

  // Get order status info
  const getOrderStatus = useCallback(() => {
    if (!trackingOrder) return null;

    return {
      status: trackingOrder.status,
      statusDisplay: trackingOrder.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      lastUpdated: trackingOrder.updatedAt || trackingOrder.createdAt,
      orderNumber: trackingOrder.orderNumber,
      total: trackingOrder.total
    };
  }, [trackingOrder]);

  // Check if order is in active state
  const isActiveOrder = useCallback(() => {
    if (!trackingOrder) return false;
    return !['delivered', 'cancelled'].includes(trackingOrder.status);
  }, [trackingOrder]);

  // Get estimated completion time
  const getEstimatedCompletion = useCallback(() => {
    if (!trackingOrder) return null;

    const deliveryInfo = getDeliveryInfo(trackingOrder._id);
    if (deliveryInfo?.estimatedDeliveryTime) {
      return new Date(deliveryInfo.estimatedDeliveryTime);
    }

    // Fallback estimation based on order type and status
    const created = new Date(trackingOrder.createdAt);
    let estimatedMinutes = 30; // Default 30 minutes

    switch (trackingOrder.orderType) {
      case 'pickup':
        estimatedMinutes = 15;
        break;
      case 'delivery':
        estimatedMinutes = 60;
        break;
      default:
        estimatedMinutes = 30;
    }

    return new Date(created.getTime() + (estimatedMinutes * 60 * 1000));
  }, [trackingOrder, getDeliveryInfo]);

  // Get order progress percentage
  const getOrderProgress = useCallback(() => {
    if (!trackingOrder) return 0;

    const statusFlow = ['pending', 'processing', 'ready_for_pickup', 'ready_for_delivery', 'driver_assigned', 'picked_up', 'in_transit', 'delivered'];
    const currentIndex = statusFlow.indexOf(trackingOrder.status);
    
    if (currentIndex === -1) return 0;
    if (trackingOrder.status === 'cancelled') return 0;
    
    return ((currentIndex + 1) / statusFlow.length) * 100;
  }, [trackingOrder]);

  return {
    // Order data
    order: trackingOrder,
    orderStatus: getOrderStatus(),
    
    // Status
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    lastUpdate,
    isActive: isActiveOrder(),
    progress: getOrderProgress(),
    estimatedCompletion: getEstimatedCompletion(),
    
    // Actions
    startTracking,
    stopTracking,
    
    // Helpers
    getDeliveryInfo: trackingOrder ? () => getDeliveryInfo(trackingOrder._id) : () => null
  };
};

export default useRealTimeOrderTracking;

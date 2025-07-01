import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotifications } from './NotificationContext';

const RealTimeOrderContext = createContext();

export const useRealTimeOrders = () => {
  const context = useContext(RealTimeOrderContext);
  if (!context) {
    throw new Error('useRealTimeOrders must be used within a RealTimeOrderProvider');
  }
  return context;
};

export const RealTimeOrderProvider = ({ children }) => {
  const { socket, isConnected, addEventListener } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderStats, setOrderStats] = useState({});
  const [deliveryUpdates, setDeliveryUpdates] = useState({});

  // Handle customer order updates
  const handleCustomerOrderUpdate = useCallback((data) => {
    console.log('📱 Customer order update received:', data);
    
    const { order, type, newStatus, previousStatus } = data;
    
    if (order) {
      // Update orders list
      setOrders(prevOrders => {
        const orderIndex = prevOrders.findIndex(o => o._id === order._id);
        
        if (orderIndex >= 0) {
          // Update existing order
          const updatedOrders = [...prevOrders];
          updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], ...order };
          return updatedOrders;
        } else if (type === 'order_created') {
          // Add new order to the beginning
          return [order, ...prevOrders];
        }
        
        return prevOrders;
      });

      // Update current order if it matches
      setCurrentOrder(prevOrder => {
        if (prevOrder && prevOrder._id === order._id) {
          return { ...prevOrder, ...order };
        }
        return prevOrder;
      });
    }
  }, []);

  // Handle single order updates
  const handleSingleOrderUpdate = useCallback((data) => {
    console.log('📦 Single order update received:', data);
    
    const { order, operation, orderId, changes } = data;
    
    setOrders(prevOrders => {
      switch (operation) {
        case 'created':
          // Add new order if it doesn't exist
          if (order && !prevOrders.find(o => o._id === order._id)) {
            return [order, ...prevOrders];
          }
          return prevOrders;
          
        case 'updated':
          // Update existing order
          if (order) {
            return prevOrders.map(o => 
              o._id === order._id ? { ...o, ...order } : o
            );
          }
          return prevOrders;
          
        case 'deleted':
          // Remove order from list
          return prevOrders.filter(o => o._id !== orderId);
          
        default:
          return prevOrders;
      }
    });

    // Update current order
    if (operation === 'updated' && order) {
      setCurrentOrder(prevOrder => {
        if (prevOrder && prevOrder._id === order._id) {
          return { ...prevOrder, ...order };
        }
        return prevOrder;
      });
    } else if (operation === 'deleted') {
      setCurrentOrder(prevOrder => {
        if (prevOrder && prevOrder._id === orderId) {
          return null;
        }
        return prevOrder;
      });
    }
  }, []);

  // Handle delivery tracking updates
  const handleDeliveryUpdate = useCallback((data) => {
    console.log('🚚 Delivery update received:', data);
    
    const { orderId, status, estimatedDeliveryTime, orderType } = data;
    
    setDeliveryUpdates(prev => ({
      ...prev,
      [orderId]: {
        status,
        estimatedDeliveryTime,
        orderType,
        updatedAt: new Date()
      }
    }));
  }, []);

  // Handle order stats updates
  const handleOrderStatsUpdate = useCallback((data) => {
    console.log('📊 Order stats update received:', data);
    setOrderStats(data.stats);
  }, []);

  // Join order room for specific order tracking
  const joinOrderRoom = useCallback((orderId) => {
    if (socket && isConnected) {
      socket.emit('join_order_room', orderId);
      console.log(`Joined order room: ${orderId}`);
    }
  }, [socket, isConnected]);

  // Leave order room
  const leaveOrderRoom = useCallback((orderId) => {
    if (socket && isConnected) {
      socket.emit('leave_order_room', orderId);
      console.log(`Left order room: ${orderId}`);
    }
  }, [socket, isConnected]);

  // Set current order for tracking
  const setCurrentOrderForTracking = useCallback((order) => {
    // Leave previous order room
    if (currentOrder) {
      leaveOrderRoom(currentOrder._id);
    }
    
    // Set new current order
    setCurrentOrder(order);
    
    // Join new order room
    if (order) {
      joinOrderRoom(order._id);
    }
  }, [currentOrder, joinOrderRoom, leaveOrderRoom]);

  // Get order by ID from current orders
  const getOrderById = useCallback((orderId) => {
    return orders.find(order => order._id === orderId) || null;
  }, [orders]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Get active orders (not completed or cancelled)
  const getActiveOrders = useCallback(() => {
    return orders.filter(order => 
      !['completed', 'cancelled'].includes(order.status)
    );
  }, [orders]);

  // Get delivery info for an order
  const getDeliveryInfo = useCallback((orderId) => {
    return deliveryUpdates[orderId] || null;
  }, [deliveryUpdates]);

  // Set up real-time listeners
  useEffect(() => {
    if (!isConnected) return;

    console.log('🔌 Setting up real-time order listeners');

    // Order-specific events using addEventListener
    const cleanups = [
      addEventListener('customer_order_update', handleCustomerOrderUpdate),
      addEventListener('single_order_update', handleSingleOrderUpdate),
      addEventListener('delivery_update', handleDeliveryUpdate),
      addEventListener('order_stats_update', handleOrderStatsUpdate)
    ];

    return () => {
      console.log('🔌 Cleaning up real-time order listeners');
      cleanups.forEach(cleanup => cleanup());
    };
  }, [isConnected, addEventListener, handleCustomerOrderUpdate, handleSingleOrderUpdate, handleDeliveryUpdate, handleOrderStatsUpdate]);

  const value = {
    // Data
    orders,
    currentOrder,
    orderStats,
    deliveryUpdates,
    
    // Actions
    setCurrentOrderForTracking,
    joinOrderRoom,
    leaveOrderRoom,
    
    // Helpers
    getOrderById,
    getOrdersByStatus,
    getActiveOrders,
    getDeliveryInfo,
    
    // State setters (for manual updates)
    setOrders,
    setCurrentOrder
  };

  return (
    <RealTimeOrderContext.Provider value={value}>
      {children}
    </RealTimeOrderContext.Provider>
  );
};

export default RealTimeOrderContext;

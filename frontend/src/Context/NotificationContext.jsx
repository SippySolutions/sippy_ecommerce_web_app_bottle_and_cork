import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socket';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Initialize socket connection once - Synchronized with store owner implementation
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log('Initializing global socket connection...');
    initializeSocket();

    return () => {
      console.log('Cleaning up global socket connection...');
      cleanup();
    };
  }, []);

  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    try {
      // Connect to socket using socket service
      const socket = socketService.connect();

      // Set up event listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
      socket.on('reconnect', handleReconnect);
      socket.on('reconnect_error', handleReconnectError);

      // Handle specific customer notifications
      socket.on('customer_notification', handleCustomerNotification);
      socket.on('customer_order_update', handleCustomerOrderUpdate);
      socket.on('newOrder', handleNewOrder); // Store owner sync
      socket.on('orderStatusUpdated', handleOrderStatusUpdate); // Store owner sync

      console.log('Socket initialized successfully');
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionError(error.message);
    }
  }, []);

  const handleConnect = () => {
    console.log('Socket connected:', socketService.socket?.id);
    setIsConnected(true);
    setConnectionError(null);
    setReconnectAttempts(0);
    
    // Clear any pending reconnect timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const handleDisconnect = (reason) => {
    console.log('Socket disconnected:', reason);
    setIsConnected(false);
    
    // Only show error for unexpected disconnections
    if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
      console.warn('Unexpected socket disconnection:', reason);
      
      // Attempt automatic reconnection for certain disconnect reasons
      if (reason === 'transport close' || reason === 'transport error') {
        attemptReconnection();
      }
    }
  };

  const handleConnectError = (error) => {
    console.error('Socket connection error:', error);
    setConnectionError(error.message);
    setIsConnected(false);
    
    // Attempt reconnection after a delay
    attemptReconnection();
  };

  const handleReconnect = (attemptNumber) => {
    console.log('🔄 Reconnected to Socket.IO server on attempt:', attemptNumber);
    setIsConnected(true);
    setConnectionError(null);
  };

  const handleReconnectError = (error) => {
    console.error('Reconnection error:', error.message);
    setConnectionError('Reconnection failed');
  };

  const attemptReconnection = () => {
    if (reconnectAttempts >= 5) {
      console.error('Max reconnection attempts reached');
      toast.error('Connection lost. Please refresh the page.');
      return;
    }

    if (reconnectTimeoutRef.current) return; // Already attempting

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Exponential backoff
    console.log(`Attempting reconnection in ${delay}ms...`);

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      setReconnectAttempts(prev => prev + 1);
      
      if (socketService.socket && !socketService.socket.connected) {
        console.log('Manually reconnecting socket...');
        socketService.reconnect();
      }
    }, delay);
  };

  const cleanup = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    socketService.disconnect();
  };

  // Handle customer notifications
  const handleCustomerNotification = useCallback((notification) => {
    addNotification(notification);
  }, []);

  // Handle customer order updates  
  const handleCustomerOrderUpdate = useCallback((data) => {
    console.log('📱 Customer order update received:', data);
    addNotification({
      type: 'order_update',
      title: 'Order Update',
      message: data.message,
      timestamp: data.timestamp
    });
  }, []);

  // Handle new order notifications (store owner sync)
  const handleNewOrder = useCallback((data) => {
    console.log('📋 New order notification received:', data);
    // Only show to store owners/admins
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'storeOwner' || userRole === 'admin') {
      addNotification({
        type: 'new_order',
        title: data.notification.title,
        message: data.notification.message,
        timestamp: data.notification.timestamp
      });
    }
  }, []);

  // Handle order status updates (store owner sync)
  const handleOrderStatusUpdate = useCallback((data) => {
    console.log('🔄 Order status update received:', data);
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'storeOwner' || userRole === 'admin') {
      addNotification({
        type: 'order_status_update',
        title: 'Order Status Updated',
        message: `Order #${data.orderNumber} status updated to ${data.status}`,
        timestamp: new Date()
      });
    }
  }, []);

  // Add notification to list
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      read: false,
      timestamp: notification.timestamp || new Date()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    if (notification.type === 'order_status_update') {
      toast.info(notification.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Socket event subscription hook
  const addEventListener = useCallback((event, callback) => {
    if (!socketService.socket) {
      console.warn('Socket not available for event:', event);
      return () => {};
    }

    socketService.on(event, callback);
    
    // Return cleanup function
    return () => {
      socketService.off(event, callback);
    };
  }, []);

  // Socket emit function
  const emit = useCallback((event, data) => {
    if (!isConnected) {
      console.warn('Cannot emit event, socket not connected:', event);
      return false;
    }
    
    socketService.emit(event, data);
    return true;
  }, [isConnected]);

  // Reconnect function
  const reconnect = useCallback(() => {
    return socketService.reconnect();
  }, []);

  // Initialize socket on mount and when token changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (token && !socketService.socket) {
        initializeSocket();
      } else if (!token && socketService.socket) {
        socketService.disconnect();
        setIsConnected(false);
      }
    };

    // Listen for storage changes (login/logout)
    window.addEventListener('storage', handleStorageChange);
    
    // Initialize on mount
    const token = localStorage.getItem('token');
    if (token) {
      initializeSocket();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      cleanup();
    };
  }, [initializeSocket]);

  const value = {
    // Connection state
    socket: socketService.socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    
    // Notifications
    notifications,
    unreadCount,
    
    // Actions
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification,
    addEventListener,
    emit,
    reconnect,
    
    // Utils
    initializeSocket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

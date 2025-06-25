import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
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
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const socketUrl = API_BASE_URL.replace('/api', '');

    console.log('Connecting to Socket.IO server:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      setIsConnected(true);
      setConnectionError('');
      setSocket(newSocket);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to Socket.IO server on attempt:', attemptNumber);
      setIsConnected(true);
      setConnectionError('');
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error.message);
      setConnectionError('Reconnection failed');
    });

    // Connection status updates
    newSocket.on('connection_status', (data) => {
      console.log('Connection status:', data.message);
    });

    // Handle general notifications
    newSocket.on('customer_notification', (notification) => {
      addNotification(notification);
    });

    return newSocket;
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

  // Initialize socket on mount and when token changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (token && !socket) {
        initializeSocket();
      } else if (!token && socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };

    // Listen for storage changes (login/logout)
    window.addEventListener('storage', handleStorageChange);
    
    // Initialize on mount
    initializeSocket();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (socket) {
        socket.disconnect();
      }
    };
  }, [initializeSocket]);

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value = {
    // Connection state
    socket,
    isConnected,
    connectionError,
    
    // Notifications
    notifications,
    unreadCount,
    
    // Actions
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification,
    
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

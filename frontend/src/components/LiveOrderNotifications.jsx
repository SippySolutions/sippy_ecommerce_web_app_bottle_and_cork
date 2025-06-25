import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../Context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../Context/CMSContext';

const LiveOrderNotifications = () => {
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotifications();
  
  const { getTheme } = useCMS();
  const theme = getTheme();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'order_updates', 'delivery'

  const getNotificationIcon = (type) => {
    const icons = {
      'order_created': '🆕',
      'order_status_update': '📦',
      'delivery_tracking_update': '🚚',
      'order_completed': '✅',
      'order_cancelled': '❌'
    };
    return icons[type] || '📱';
  };

  const getNotificationColor = (type, read) => {
    if (read) return 'border-gray-200 bg-gray-50';
    
    const colors = {
      'order_created': 'border-blue-200 bg-blue-50',
      'order_status_update': 'border-green-200 bg-green-50',
      'delivery_tracking_update': 'border-orange-200 bg-orange-50',
      'order_completed': 'border-emerald-200 bg-emerald-50',
      'order_cancelled': 'border-red-200 bg-red-50'
    };
    return colors[type] || 'border-purple-200 bg-purple-50';
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navigate to order tracking if order-related
    if (notification.order?._id) {
      navigate(`/orders/${notification.order._id}`);
      setShowNotifications(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'order_updates') {
      return ['order_created', 'order_status_update', 'order_completed', 'order_cancelled'].includes(notif.type);
    }
    if (filter === 'delivery') {
      return notif.type === 'delivery_tracking_update';
    }
    return true;
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!isConnected || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        {/* Notification Bell */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          style={{ 
            backgroundColor: theme.primary,
            color: 'white'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 17h5l-5-5v6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10.97 4.97a.235.235 0 0 0-.02 0 .240.240 0 0 0-.02 0 .240.240 0 0 1 .02 0c1.164 0 2.234.346 3.116.94a5.5 5.5 0 0 1 1.91 2.556A5.48 5.48 0 0 1 16 10.5v3.793l1.146 1.147a.5.5 0 0 1-.353.853H7.207a.5.5 0 0 1-.353-.853L8 14.293V10.5a5.48 5.48 0 0 1 .024-1.007 5.5 5.5 0 0 1 1.91-2.556A5.48 5.48 0 0 1 10.97 4.97z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          
          {/* Badge */}
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
          
          {/* Connection indicator */}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
        </button>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Live Updates</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex space-x-1">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'order_updates', label: 'Orders' },
                    { key: 'delivery', label: 'Delivery' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        filter === key
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-5 5-5-5" />
                    </svg>
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          getNotificationColor(notification.type, notification.read)
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-xl">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${
                              notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                            }`}>
                              {notification.message}
                            </p>
                            
                            {notification.order && (
                              <p className="text-xs text-gray-500 mt-1">
                                Order #{notification.order.orderNumber} • ${notification.order.total?.toFixed(2)}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {isConnected ? '🟢 Live updates active' : '🔴 Connection lost'}
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveOrderNotifications;

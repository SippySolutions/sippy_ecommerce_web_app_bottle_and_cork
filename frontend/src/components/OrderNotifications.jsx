import React, { useState, useEffect } from 'react';
import { fetchUserOrders } from '../services/api';
import OrderStatusBadge from './OrderStatusBadge';

const OrderNotifications = ({ userId }) => {
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const response = await fetchUserOrders();
        if (response.success) {
          // Get orders updated in the last 24 hours
          const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const recentlyUpdated = response.orders.filter(order => {
            const updatedAt = new Date(order.updatedAt || order.createdAt);
            return updatedAt > last24Hours && order.status !== 'completed';
          });
          
          setRecentUpdates(recentlyUpdated);
        }
      } catch (error) {
        console.error('Error checking order updates:', error);
      }
    };

    if (userId) {
      checkForUpdates();
      // Check every 30 seconds for updates
      const interval = setInterval(checkForUpdates, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  if (recentUpdates.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5m-6 10v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1M1 12h22" />
          </svg>
          {recentUpdates.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {recentUpdates.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border max-h-96 overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Order Updates</h3>
              <p className="text-sm text-gray-600">Recent changes to your orders</p>
            </div>
            
            <div className="divide-y">
              {recentUpdates.map(order => (
                <div key={order._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Order #{order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} size="small" />
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {order.items.length} items • ${order.total.toFixed(2)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(order.updatedAt || order.createdAt).toLocaleTimeString()}
                    </span>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t bg-gray-50">
              <button 
                onClick={() => setShowNotifications(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderNotifications;

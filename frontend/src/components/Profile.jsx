import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { fetchUserOrders } from '../services/api';
import MyDetails from './ProfileSections/MyDetails';
import OrderHistory from './ProfileSections/OrderHistory';
import Addresses from './ProfileSections/Addresses';
import Billing from './ProfileSections/Billing';
import OrderStatusBadge from './OrderStatusBadge';

const Profile = () => {
  const { user, isAuthenticated, logout, refreshUser } = useContext(AuthContext);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Simple refresh function for child components
  const handleRefreshUser = () => {
    if (refreshUser) {
      refreshUser();
    }
  };

  // Load active orders for overview
  useEffect(() => {
    const loadActiveOrders = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetchUserOrders();
          if (response.success) {
            const active = response.orders.filter(order => 
              ['new', 'accepted', 'packing', 'ready', 'out_for_delivery'].includes(order.status)
            );
            setActiveOrders(active);
          }
        } catch (error) {
          console.error('Error loading active orders:', error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    loadActiveOrders();
  }, [isAuthenticated]);

  // Handle URL query parameters for tab switching
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'orders', 'addresses', 'billing'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Handle redirect to login
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
          <button 
            onClick={() => window.location.href = '/account'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'My Details' },
    { id: 'orders', label: 'Order History' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'billing', label: 'Billing' }
  ];  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your profile, orders, addresses, and payment methods
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Active Orders Overview */}
      {!loadingOrders && activeOrders.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="animate-pulse mr-2">🔄</span>
                Current Orders ({activeOrders.length})
              </h2>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Orders →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.slice(0, 3).map(order => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </div>
                    <OrderStatusBadge status={order.status} size="small" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{order.items.length} items</span>
                    <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="h-6 w-6 object-contain rounded"
                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                      />
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-gray-500">+{order.items.length - 3}</span>
                    )}
                  </div>
                  
                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Track Order
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full">        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <MyDetails />
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <OrderHistory />
            </motion.div>
          )}

          {activeTab === 'addresses' && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Addresses addresses={user?.addresses || []} refreshUser={handleRefreshUser} />
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Billing refreshUser={handleRefreshUser} />
            </motion.div>
          )}        </AnimatePresence>
        </div>

        {/* Legal Links Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Legal</h3>
            <div className="flex justify-center space-x-6 text-sm">
              <Link 
                to="/terms-and-conditions" 
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Terms & Conditions
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                to="/privacy-policy" 
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserOrders } from '../../services/api';
import { toast } from 'react-toastify';
import InlineLoader from '../InlineLoader';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchUserOrders();
      if (response.success) {
        setOrders(response.orders);
        categorizeOrders(response.orders);
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };  const categorizeOrders = (orders) => {
    const active = orders.filter(order => 
      ['new', 'accepted', 'packing', 'ready', 'out_for_delivery'].includes(order.status)
    );
    const completed = orders.filter(order => 
      ['completed', 'cancelled'].includes(order.status)
    );
    
    setActiveOrders(active);
    setCompletedOrders(completed);
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    
    if (statusFilter === 'active') {
      filtered = activeOrders;
    } else if (statusFilter === 'completed') {
      filtered = completedOrders;
    }
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    return filtered;
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New Order', icon: '🆕' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted', icon: '✅' },
      packing: { color: 'bg-yellow-100 text-yellow-800', label: 'Packing', icon: '📦' },
      ready: { color: 'bg-purple-100 text-purple-800', label: 'Ready', icon: '🚀' },
      out_for_delivery: { color: 'bg-orange-100 text-orange-800', label: 'Out for Delivery', icon: '🚚' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: '✨' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: '❌' }
    };
    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: '❓' };
  };

  const getStatusProgress = (status) => {
    const statusFlow = ['new', 'accepted', 'packing', 'ready', 'out_for_delivery', 'completed'];
    const currentIndex = statusFlow.indexOf(status);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / statusFlow.length) * 100;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = (order) => {
    if (order.status === 'completed') return null;
    if (order.scheduledDelivery?.date) {
      return new Date(order.scheduledDelivery.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // Estimate based on order type and status
    const createdDate = new Date(order.createdAt);
    let estimatedDays = 1; // Default same day for liquor delivery
    
    if (order.orderType === 'pickup') {
      estimatedDays = 0; // Same day pickup
    }
    
    const estimatedDate = new Date(createdDate.getTime() + (estimatedDays * 24 * 60 * 60 * 1000));
    return estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <InlineLoader 
          text="Loading your orders..." 
          size="large"
        />
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
            <p className="text-gray-600 mt-1">Track and manage all your orders</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{activeOrders.length}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{completedOrders.filter(o => o.status === 'completed').length}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-gray-600">{orders.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Orders', count: orders.length },
                { key: 'active', label: 'Active', count: activeOrders.length },
                { key: 'completed', label: 'Completed', count: completedOrders.length }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order number or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && statusFilter !== 'completed' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="animate-pulse mr-2">🔄</span>
            Current Orders ({activeOrders.length})
          </h3>
          {activeOrders.filter(order => 
            statusFilter === 'all' || statusFilter === 'active' || order.status === statusFilter
          ).map(order => (
            <CurrentOrderCard key={order._id} order={order} navigate={navigate} />
          ))}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {statusFilter !== 'active' && (
          <h3 className="text-lg font-semibold text-gray-900">
            {statusFilter === 'completed' ? 'Order History' : 'All Orders'} ({filteredOrders.length})
          </h3>
        )}

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {orders.length === 0 ? 'Start shopping to see your orders here!' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} navigate={navigate} />
          ))
        )}
      </div>
    </div>
  );
};

// Enhanced Current Order Card Component
const CurrentOrderCard = ({ order, navigate }) => {
  const statusInfo = getStatusInfo(order.status);
  const progress = getStatusProgress(order.status);
  const estimatedDelivery = getEstimatedDelivery(order);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-md border-l-4 border-blue-500 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">{statusInfo.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Order Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Order Date:</span>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            {estimatedDelivery && (
              <div>
                <span className="text-gray-500">Est. Delivery:</span>
                <p className="font-medium text-green-600">{estimatedDelivery}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Items:</span>
              <p className="font-medium">{order.items.length} items</p>
            </div>
            <div>
              <span className="text-gray-500">Total:</span>
              <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/orders/${order._id}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Track Order
          </button>
          {order.status === 'new' && (
            <button className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Mini Product Preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          {order.items.slice(0, 4).map((item, index) => (
            <div key={index} className="flex-shrink-0 flex items-center gap-2 bg-white rounded-lg p-2">
              <img
                src={item.image || '/placeholder.png'}
                alt={item.name}
                className="h-8 w-8 object-contain rounded"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
              <span className="text-sm text-gray-600">{item.quantity}x</span>
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="flex-shrink-0 text-sm text-gray-500">
              +{order.items.length - 4} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Regular Order Card Component
const OrderCard = ({ order, navigate }) => {
  const statusInfo = getStatusInfo(order.status);
  
  return (
    <div className="bg-white rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg">{statusInfo.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500">Items:</span>
              <p className="font-medium">{order.items.length} items</p>
            </div>
            <div>
              <span className="text-gray-500">Total:</span>
              <p className="font-bold">${order.total.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium capitalize">{order.orderType}</p>
            </div>
            {order.paymentInfo?.method && (
              <div>
                <span className="text-gray-500">Payment:</span>
                <p className="font-medium">
                  {order.paymentInfo.method === 'card' ? 'Credit Card' : 
                   order.paymentInfo.method === 'saved_card' ? 'Saved Card' : 'Payment'}
                  {order.paymentInfo.lastFour && ` ****${order.paymentInfo.lastFour}`}
                </p>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-700 mb-1">
                {order.orderType === 'pickup' ? 'Pickup Location:' : 'Delivery Address:'}
              </h4>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/orders/${order._id}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Details
          </button>
          {order.status === 'completed' && (
            <button className="px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              Reorder
            </button>
          )}
        </div>
      </div>

      {/* Product Preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {order.items.slice(0, 6).map((item, index) => (
            <div key={index} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <img
                src={item.image || '/placeholder.png'}
                alt={item.name}
                className="h-12 w-12 object-contain mb-1"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
              <p className="text-xs text-center text-gray-600 font-medium truncate w-full">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
          ))}
          {order.items.length > 6 && (
            <div className="flex items-center justify-center p-2 bg-gray-100 rounded-lg">
              <span className="text-xs text-gray-500 text-center">
                +{order.items.length - 6}<br />more items
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get status info (moved outside component)
const getStatusInfo = (status) => {
  const statusMap = {
    new: { color: 'bg-blue-100 text-blue-800', label: 'New Order', icon: '🆕' },
    accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted', icon: '✅' },
    packing: { color: 'bg-yellow-100 text-yellow-800', label: 'Packing', icon: '📦' },
    ready: { color: 'bg-purple-100 text-purple-800', label: 'Ready', icon: '🚀' },
    out_for_delivery: { color: 'bg-orange-100 text-orange-800', label: 'Out for Delivery', icon: '🚚' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: '✨' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: '❌' }
  };
  return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: '❓' };
};

const getStatusProgress = (status) => {
  const statusFlow = ['new', 'accepted', 'packing', 'ready', 'out_for_delivery', 'completed'];
  const currentIndex = statusFlow.indexOf(status);
  if (currentIndex === -1) return 0;
  return ((currentIndex + 1) / statusFlow.length) * 100;
};

const getEstimatedDelivery = (order) => {
  if (order.status === 'completed') return null;
  if (order.scheduledDelivery?.date) {
    return new Date(order.scheduledDelivery.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Estimate based on order type and status
  const createdDate = new Date(order.createdAt);
  let estimatedDays = 1; // Default same day for liquor delivery
  
  if (order.orderType === 'pickup') {
    estimatedDays = 0; // Same day pickup
  }
  
  const estimatedDate = new Date(createdDate.getTime() + (estimatedDays * 24 * 60 * 60 * 1000));
  return estimatedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default OrderHistory;
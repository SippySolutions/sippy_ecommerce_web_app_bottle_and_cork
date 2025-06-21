import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserOrders } from '../../services/api';
import { toast } from 'react-toastify';
import InlineLoader from '../InlineLoader'; // Import branded loader

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchUserOrders();
      if (response.success) {
        setOrders(response.orders);
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
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-orange-600',
      processing: 'text-blue-600',
      shipped: 'text-purple-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
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
      <div className="flex justify-center items-center h-64">
        <InlineLoader 
          text="Loading your orders..." 
          size="large"
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4 flex items-center">
        <i className="material-icons mr-2">shopping_cart</i> ORDER HISTORY ({orders.length})
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search orders by number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded px-4 py-2"
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {orders.length === 0 ? 'No orders found' : 'No orders match your search'}
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div key={order._id} className="border rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-gray-800">
                  Order #{order.orderNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  Status: <span className={`font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Ordered: {formatDate(order.createdAt)}
                </p>
                {order.paymentInfo?.transactionId && (
                  <p className="text-xs text-gray-500">
                    Transaction ID: {order.paymentInfo.transactionId}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{order.items.length} Items</p>
                <p className="text-lg font-bold text-gray-800">${order.total.toFixed(2)}</p>                {order.paymentInfo?.method && (
                  <p className="text-xs text-gray-500">
                    {order.paymentInfo.method === 'card' ? 'Credit Card' : 
                     order.paymentInfo.method === 'saved_card' ? 'Saved Card' : 'Payment'}
                    {order.paymentInfo.lastFour && ` ****${order.paymentInfo.lastFour}`}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Track Order
                </button>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Shipping Address:</h4>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
              </div>
            )}

            {/* Product List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {order.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="border rounded-lg shadow-sm p-3 flex flex-col items-center"
                >
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    className="h-16 w-16 object-contain mb-2"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                  <h4 className="text-sm font-bold text-gray-800 text-center mb-1">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="text-sm font-semibold text-gray-800">
                    Total: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory;
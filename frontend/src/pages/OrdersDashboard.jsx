import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import OrderStatusManager from '../components/OrderStatusManager';

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('new');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusTabs = [
    { key: 'new', label: 'New Orders', count: 0 },
    { key: 'accepted', label: 'Accepted', count: 0 },
    { key: 'packing', label: 'Packing', count: 0 },
    { key: 'ready', label: 'Ready', count: 0 },
    { key: 'out_for_delivery', label: 'Out for Delivery', count: 0 },
    { key: 'completed', label: 'Completed', count: 0 },
    { key: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  const fetchOrdersByStatus = async (status) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/status/${status}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersByStatus(selectedStatus);
  }, [selectedStatus]);

  const handleStatusUpdate = (orderId, newStatus) => {
    // Remove order from current list if status changed
    if (newStatus !== selectedStatus) {
      setOrders(orders.filter(order => order._id !== orderId));
    }
    setSelectedOrder(null);
  };

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and track all your orders</p>
        </div>

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedStatus === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {orders.length > 0 && selectedStatus === tab.key && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {orders.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {statusTabs.find(tab => tab.key === selectedStatus)?.label} ({orders.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No orders found for this status.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-6 cursor-pointer hover:bg-gray-50 ${
                        selectedOrder?._id === order._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.customer?.firstName} {order.customer?.lastName} 
                            {order.customerType === 'guest' && ' (Guest)'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.items?.length} item(s)
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.orderType}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Details & Status Management */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="space-y-6">
                {/* Order Details */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order Number</p>
                      <p className="text-sm text-gray-900">{selectedOrder.orderNumber}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer</p>
                      <p className="text-sm text-gray-900">
                        {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                        {selectedOrder.customerType === 'guest' && ' (Guest)'}
                      </p>
                      {selectedOrder.customer?.email && (
                        <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                      )}
                      {selectedOrder.guestInfo?.email && (
                        <p className="text-sm text-gray-600">{selectedOrder.guestInfo.email}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Order Type</p>
                      <p className="text-sm text-gray-900 capitalize">{selectedOrder.orderType}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Total</p>
                      <p className="text-sm text-gray-900">{formatCurrency(selectedOrder.total)}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Items</p>
                      <div className="text-sm text-gray-900">
                        {selectedOrder.items?.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Manager */}
                <OrderStatusManager
                  orderId={selectedOrder._id}
                  currentStatus={selectedOrder.status}
                  onStatusUpdate={(newStatus) => handleStatusUpdate(selectedOrder._id, newStatus)}
                />
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500 text-center">
                  Select an order to view details and manage status
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;

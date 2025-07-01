import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const OrderStatusManager = ({ orderId, currentStatus, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  
  const statusFlow = [
    { key: 'pending', label: 'Pending', color: 'bg-blue-100 text-blue-800' },
    { key: 'processing', label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', color: 'bg-purple-100 text-purple-800' },
    { key: 'ready_for_delivery', label: 'Ready for Delivery', color: 'bg-purple-100 text-purple-800' },
    { key: 'driver_assigned', label: 'Driver Assigned', color: 'bg-indigo-100 text-indigo-800' },
    { key: 'picked_up', label: 'Picked Up', color: 'bg-orange-100 text-orange-800' },
    { key: 'in_transit', label: 'In Transit', color: 'bg-orange-100 text-orange-800' },
    { key: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const getValidNextStatuses = (currentStatus) => {
    const transitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['ready_for_pickup', 'ready_for_delivery', 'cancelled'],
      'ready_for_pickup': ['delivered', 'cancelled'], // Customer picks up directly
      'ready_for_delivery': ['driver_assigned', 'cancelled'],
      'driver_assigned': ['picked_up', 'ready_for_delivery', 'cancelled'], // Can reassign
      'picked_up': ['in_transit', 'cancelled'],
      'in_transit': ['delivered', 'ready_for_delivery', 'cancelled'], // Failed delivery
      'delivered': [],
      'cancelled': []
    };
    
    return transitions[currentStatus] || [];
  };

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        if (onStatusUpdate) {
          onStatusUpdate(newStatus);
        }
      } else {
        toast.error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Order accepted successfully');
        if (onStatusUpdate) {
          onStatusUpdate('accepted');
        }
      } else {
        toast.error(data.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    } finally {
      setLoading(false);
    }
  };

  const currentStatusInfo = statusFlow.find(status => status.key === currentStatus);
  const validNextStatuses = getValidNextStatuses(currentStatus);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Status Management</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Current Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatusInfo?.color || 'bg-gray-100 text-gray-800'}`}>
            {currentStatusInfo?.label || currentStatus}
          </span>
        </div>
      </div>

      {currentStatus === 'pending' && (
        <div className="mb-4">
          <button
            onClick={handleAcceptOrder}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Accepting...' : 'Accept Order'}
          </button>
        </div>
      )}

      {validNextStatuses.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Update Status To:</h4>
          <div className="flex flex-wrap gap-2">
            {validNextStatuses.map(statusKey => {
              const statusInfo = statusFlow.find(s => s.key === statusKey);
              return (
                <button
                  key={statusKey}
                  onClick={() => handleStatusUpdate(statusKey)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    statusKey === 'cancelled' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? 'Updating...' : statusInfo?.label || statusKey}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {validNextStatuses.length === 0 && currentStatus !== 'pending' && (
        <div className="text-sm text-gray-500">
          This order is in its final state and cannot be updated further.
        </div>
      )}
    </div>
  );
};

export default OrderStatusManager;

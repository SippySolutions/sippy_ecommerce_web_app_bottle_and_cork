import React from 'react';

const OrderStatusBadge = ({ status, size = 'normal', showProgress = false }) => {
  const getStatusInfo = (status) => {
    const statusMap = {
      new: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'New Order', icon: '🆕', progressColor: 'bg-blue-500' },
      accepted: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Accepted', icon: '✅', progressColor: 'bg-green-500' },
      packing: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Packing', icon: '📦', progressColor: 'bg-yellow-500' },
      ready: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Ready', icon: '🚀', progressColor: 'bg-purple-500' },
      out_for_delivery: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Out for Delivery', icon: '🚚', progressColor: 'bg-orange-500' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed', icon: '✨', progressColor: 'bg-green-500' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled', icon: '❌', progressColor: 'bg-red-500' }
    };
    return statusMap[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status, icon: '❓', progressColor: 'bg-gray-500' };
  };

  const getStatusProgress = (status) => {
    const statusFlow = ['new', 'accepted', 'packing', 'ready', 'out_for_delivery', 'completed'];
    const currentIndex = statusFlow.indexOf(status);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / statusFlow.length) * 100;
  };

  const statusInfo = getStatusInfo(status);
  const progress = getStatusProgress(status);
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    normal: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center rounded-full font-medium border ${statusInfo.color} ${sizeClasses[size]}`}>
        <span className="mr-1">{statusInfo.icon}</span>
        {statusInfo.label}
      </span>
      
      {showProgress && status !== 'cancelled' && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-500 ${statusInfo.progressColor}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusBadge;

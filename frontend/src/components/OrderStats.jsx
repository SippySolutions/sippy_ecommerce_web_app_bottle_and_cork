import React, { useState, useEffect } from 'react';
import { fetchUserOrders } from '../services/api';

const OrderStats = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    favoriteProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = async () => {
      try {
        const response = await fetchUserOrders();
        if (response.success) {
          const orders = response.orders;
          
          const totalOrders = orders.length;
          const activeOrders = orders.filter(order => 
            ['new', 'accepted', 'packing', 'ready', 'out_for_delivery'].includes(order.status)
          ).length;
          const completedOrders = orders.filter(order => order.status === 'completed').length;
          const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
          const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
          
          // Calculate favorite products (most ordered)
          const productCounts = {};
          orders.forEach(order => {
            order.items.forEach(item => {
              productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
            });
          });
          
          const favoriteProducts = Object.entries(productCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));

          setStats({
            totalOrders,
            activeOrders,
            completedOrders,
            totalSpent,
            averageOrderValue,
            favoriteProducts
          });
        }
      } catch (error) {
        console.error('Error calculating order stats:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.activeOrders}</div>
          <div className="text-sm text-gray-600">Active Orders</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">${stats.totalSpent.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Average Order Value</h4>
          <div className="text-2xl font-bold text-gray-700">${stats.averageOrderValue.toFixed(2)}</div>
        </div>
        
        {stats.favoriteProducts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Most Ordered</h4>
            <div className="space-y-1">
              {stats.favoriteProducts.map((product, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">{product.name}</span>
                  <span className="text-gray-900 font-medium">{product.count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStats;

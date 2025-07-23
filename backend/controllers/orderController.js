const mongoose = require('mongoose');
const realTimeService = require('../services/realTimeService');

// Helper function to get models for specific database connection
const getModels = (connection) => {
  try {
    // Check if models already exist on this connection
    if (connection.models.Order && connection.models.User && connection.models.Product) {
      return {
        Order: connection.models.Order,
        User: connection.models.User,
        Product: connection.models.Product
      };
    }

    // Define Order schema if not exists
    let Order;
    if (!connection.models.Order) {
      const OrderSchema = require('../models/Order').schema;
      Order = connection.model('Order', OrderSchema);
    } else {
      Order = connection.models.Order;
    }

    // Define User schema if not exists
    let User;
    if (!connection.models.User) {
      const UserSchema = require('../models/User').schema;
      User = connection.model('User', UserSchema);
    } else {
      User = connection.models.User;
    }

    // Define Product schema if not exists
    let Product;
    if (!connection.models.Product) {
      const ProductSchema = require('../models/Product').schema;
      Product = connection.model('Product', ProductSchema);
    } else {
      Product = connection.models.Product;
    }

    return { Order, User, Product };
  } catch (error) {
    console.error('Error getting models for connection:', error);
    throw error;
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { Order, Product } = getModels(req.dbConnection);
    
    // Query orders directly by customer field
    const orders = await Order.find({ 
      customer: userId,
      customerType: 'user' 
    })
    .populate('items.product', 'name price productimg')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get specific order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }
    
    // Get models for this database connection
    const { Order, Product } = getModels(req.dbConnection);
    
    // Find order in database
    let order = await Order.findById(orderId).populate('items.product', 'name price productimg');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check access permissions
    if (req.user) {
      const userId = req.user.id;
      
      // User can access their own orders or any guest orders
      const hasAccess = 
        (order.customer && order.customer.toString() === userId) || 
        order.customerType === 'guest';
        
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else {
      // Non-authenticated users can only access guest orders
      if (order.customerType !== 'guest') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Update order status (for admin use)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'ready_for_pickup', 'ready_for_delivery', 'driver_assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get models for this database connection
    const { Order } = getModels(req.dbConnection);

    // Get current order to validate status transition
    const currentOrder = await Order.findById(orderId);
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['ready_for_pickup', 'ready_for_delivery', 'cancelled'],
      'ready_for_pickup': ['delivered', 'cancelled'], // Customer picks up directly
      'ready_for_delivery': ['driver_assigned', 'cancelled'],
      'driver_assigned': ['picked_up', 'ready_for_delivery', 'cancelled'], // Can reassign
      'picked_up': ['in_transit', 'cancelled'],
      'in_transit': ['delivered', 'ready_for_delivery', 'cancelled'], // Failed delivery
      'delivered': [], // Final state
      'cancelled': [] // Final state
    };

    const currentStatus = currentOrder.status;
    if (!validTransitions[currentStatus].includes(status) && status !== currentStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    // Emit real-time update
    realTimeService.broadcastOrderStats();

    res.status(200).json({
      success: true,
      order,
      message: `Order status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get orders by status (for store management)
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const validStatuses = ['pending', 'processing', 'ready_for_pickup', 'ready_for_delivery', 'driver_assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get models for this database connection
    const { Order, Product, User } = getModels(req.dbConnection);

    const orders = await Order.find({ status })
      .populate('items.product', 'name price productimg')
      .populate('customer', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Accept an order (transition from new to accepted)
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get models for this database connection
    const { Order, Product } = getModels(req.dbConnection);
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept order with status: ${order.status}`
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'processing' },
      { new: true }
    ).populate('items.product', 'name price productimg');

    // Emit real-time update
    realTimeService.broadcastOrderStats();

    res.status(200).json({
      success: true,
      order: updatedOrder,
      message: 'Order accepted successfully'
    });

  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept order',
      error: error.message
    });
  }
};

// Get order status history/timeline
exports.getOrderStatusHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get models for this database connection
    const { Order } = getModels(req.dbConnection);
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Generate status timeline based on current status
    const statusFlow = ['pending', 'processing', 'ready_for_pickup', 'ready_for_delivery', 'driver_assigned', 'picked_up', 'in_transit', 'delivered'];
    const currentStatusIndex = statusFlow.indexOf(order.status);
    
    const timeline = statusFlow.map((status, index) => ({
      status,
      completed: index <= currentStatusIndex && order.status !== 'cancelled',
      current: status === order.status,
      timestamp: index <= currentStatusIndex ? order.updatedAt : null
    }));

    // If cancelled, mark only the cancelled status
    if (order.status === 'cancelled') {
      timeline.forEach(item => {
        item.completed = false;
        item.current = item.status === 'cancelled';
      });
      timeline.push({
        status: 'cancelled',
        completed: true,
        current: true,
        timestamp: order.updatedAt
      });
    }

    res.status(200).json({
      success: true,
      timeline,
      currentStatus: order.status
    });

  } catch (error) {
    console.error('Error fetching order status history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order status history',
      error: error.message
    });
  }
};

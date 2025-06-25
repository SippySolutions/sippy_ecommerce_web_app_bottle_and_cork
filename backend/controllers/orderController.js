const Order = require('../models/Order');
const User = require('../models/User');

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
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
    
    const validStatuses = ['new', 'accepted', 'packing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

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
      'new': ['accepted', 'cancelled'],
      'accepted': ['packing', 'cancelled'],
      'packing': ['ready', 'cancelled'],
      'ready': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['completed', 'cancelled'],
      'completed': [], // Final state
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
    
    const validStatuses = ['new', 'accepted', 'packing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

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
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'new') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept order with status: ${order.status}`
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'accepted' },
      { new: true }
    ).populate('items.product', 'name price productimg');

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
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Generate status timeline based on current status
    const statusFlow = ['new', 'accepted', 'packing', 'ready', 'out_for_delivery', 'completed'];
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

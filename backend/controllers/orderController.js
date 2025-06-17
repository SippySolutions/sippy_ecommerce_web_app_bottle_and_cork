const Order = require('../models/Order');
const User = require('../models/User');

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user and populate orders
    const user = await User.findById(userId).populate({
      path: 'orders',
      populate: {
        path: 'items.product',
        select: 'name price productimg'
      },
      options: { sort: { createdAt: -1 } } // Sort by newest first
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      orders: user.orders
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
    
    let query = { _id: orderId };
    
    // If user is authenticated, check if they own the order
    if (req.user) {
      const userId = req.user.id;
      query = { 
        _id: orderId, 
        $or: [
          { customer: userId },
          { customerType: 'guest' } // Allow authenticated users to view guest orders if they have the link
        ]
      };
    }
    // For non-authenticated requests, allow guest orders to be viewed
    // This allows order tracking links to work for guest users

    const order = await Order.findOne(query).populate('items.product', 'name price productimg');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
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
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
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

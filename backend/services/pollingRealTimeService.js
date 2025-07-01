const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');

class PollingRealTimeService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.lastCheckedTimestamp = new Date();
    this.pollingInterval = null;
    this.pollingRate = 10000; // Check every 10 seconds
  }

  // Initialize Socket.IO and start polling
  initialize(io) {
    this.io = io;
    this.setupSocketAuthentication();
    this.setupConnectionHandlers();
    this.startOrderPolling();
    console.log('🚀 Polling-based real-time service initialized');
  }

  // JWT authentication for Socket.IO connections (same as before)
  setupSocketAuthentication() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return next(new Error('User not found'));
        }
        
        socket.userId = decoded.id;
        socket.userRole = decoded.role || 'customer';
        socket.userName = user.firstName || user.name || 'Customer';
        socket.userEmail = user.email;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication failed'));
      }
    });
  }

  // Setup connection handlers (same as before)
  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);
      
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        userName: socket.userName,
        userEmail: socket.userEmail,
        connectedAt: new Date()
      });

      socket.join(`customer_${socket.userId}`);
      
      if (socket.userRole === 'customer') {
        socket.join('customers');
      } else if (socket.userRole === 'storeOwner' || socket.userRole === 'admin') {
        socket.join('store_notifications');
      }

      socket.on('join_order_room', (orderId) => {
        socket.join(`order_${orderId}`);
      });

      socket.on('leave_order_room', (orderId) => {
        socket.leave(`order_${orderId}`);
      });

      socket.on('disconnect', (reason) => {
        console.log(`❌ User disconnected: ${socket.userName}`);
        this.connectedUsers.delete(socket.userId);
      });

      socket.emit('connection_status', {
        type: 'connected',
        message: 'Connected to order updates (polling mode)',
        timestamp: new Date()
      });
    });
  }

  // Poll for order changes instead of using Change Streams
  startOrderPolling() {
    console.log(`📡 Starting order polling every ${this.pollingRate}ms`);
    
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForOrderUpdates();
      } catch (error) {
        console.error('Error during polling:', error);
      }
    }, this.pollingRate);
  }

  // Check for order updates since last check
  async checkForOrderUpdates() {
    try {
      // Find orders updated since last check
      const updatedOrders = await Order.find({
        updatedAt: { $gte: this.lastCheckedTimestamp }
      })
      .populate('items.product', 'name price productimg')
      .populate('customer', 'firstName lastName email phone')
      .sort({ updatedAt: 1 }); // Oldest first

      if (updatedOrders.length === 0) {
        return; // No updates
      }

      console.log(`📬 Found ${updatedOrders.length} order updates`);

      for (const order of updatedOrders) {
        await this.processOrderUpdate(order);
      }

      // Update last checked timestamp
      this.lastCheckedTimestamp = new Date();

    } catch (error) {
      console.error('Error checking for order updates:', error);
    }
  }

  // Process individual order update
  async processOrderUpdate(order) {
    // Check if this is a new order (created recently)
    const isNewOrder = this.isRecentlyCreated(order);
    
    if (isNewOrder) {
      await this.handleNewOrder(order);
    } else {
      await this.handleOrderUpdate(order);
    }
  }

  // Check if order was created recently (within polling interval)
  isRecentlyCreated(order) {
    const createdAt = new Date(order.createdAt);
    const timeDiff = Date.now() - createdAt.getTime();
    return timeDiff <= this.pollingRate * 2; // Within 2 polling cycles
  }

  // Handle new order (same logic as Change Stream version)
  async handleNewOrder(order) {
    console.log(`📨 Processing new order: ${order.orderNumber}`);

    // Emit to store owners/admins
    this.io.to('store_notifications').emit('order_notification', {
      type: 'new_order',
      order: order,
      message: `New order #${order.orderNumber} received`,
      timestamp: new Date(),
      priority: 'high'
    });

    // Emit to specific customer
    if (order.customer) {
      this.io.to(`customer_${order.customer._id}`).emit('customer_order_update', {
        type: 'order_created',
        order: order,
        message: `Your order #${order.orderNumber} has been placed successfully`,
        timestamp: new Date()
      });
    }

    // Emit to order room
    this.io.to(`order_${order._id}`).emit('single_order_update', {
      type: 'single_order_update',
      order: order,
      operation: 'created',
      timestamp: new Date()
    });
  }

  // Handle order update (same logic as Change Stream version)
  async handleOrderUpdate(order) {
    console.log(`🔄 Processing order update: ${order.orderNumber} - ${order.status}`);

    const statusMessage = this.getStatusMessage(order.status, order.orderNumber);

    // Emit to store owners/admins
    this.io.to('store_notifications').emit('order_notification', {
      type: 'order_update',
      order: order,
      message: `Order #${order.orderNumber} status updated to ${order.status}`,
      timestamp: new Date(),
      priority: this.getStatusPriority(order.status)
    });

    // Emit to specific customer
    if (order.customer) {
      this.io.to(`customer_${order.customer._id}`).emit('customer_order_update', {
        type: 'order_status_update',
        order: order,
        message: statusMessage,
        timestamp: new Date(),
        newStatus: order.status
      });

      // Send delivery tracking updates
      if (['in_transit', 'ready_for_delivery', 'driver_assigned'].includes(order.status)) {
        this.io.to(`customer_${order.customer._id}`).emit('delivery_update', {
          type: 'delivery_tracking_update',
          orderId: order._id,
          status: order.status,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          orderType: order.orderType
        });
      }
    }

    // Emit to order room
    this.io.to(`order_${order._id}`).emit('single_order_update', {
      type: 'single_order_update',
      order: order,
      operation: 'updated',
      timestamp: new Date()
    });
  }

  // Helper methods (same as Change Stream version)
  getStatusMessage(status, orderNumber) {
    const messages = {
      'pending': `Your order #${orderNumber} has been placed and is awaiting confirmation`,
      'processing': `Great news! Your order #${orderNumber} is being prepared by the store`,
      'ready_for_pickup': `Your order #${orderNumber} is ready for pickup at the store`,
      'ready_for_delivery': `Your order #${orderNumber} is ready and waiting for driver assignment`,
      'driver_assigned': `A driver has been assigned to deliver your order #${orderNumber}`,
      'picked_up': `Your order #${orderNumber} has been picked up and is on its way!`,
      'in_transit': `Your order #${orderNumber} is on its way to you!`,
      'delivered': `Your order #${orderNumber} has been successfully delivered. Thank you!`,
      'cancelled': `Your order #${orderNumber} has been cancelled`
    };
    
    return messages[status] || `Your order #${orderNumber} status has been updated to ${status}`;
  }

  getStatusPriority(status) {
    const priorities = {
      'pending': 'high',
      'processing': 'medium',
      'ready_for_pickup': 'medium',
      'ready_for_delivery': 'high',
      'driver_assigned': 'medium',
      'picked_up': 'medium',
      'in_transit': 'medium',
      'delivered': 'low',
      'cancelled': 'high'
    };
    
    return priorities[status] || 'medium';
  }

  // Broadcast order statistics
  async broadcastOrderStats() {
    try {
      const stats = await this.getOrderStats();
      
      this.io.to('store_notifications').emit('order_stats_update', {
        type: 'order_stats_update',
        stats,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error broadcasting order stats:', error);
    }
  }

  // Get order statistics
  async getOrderStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [total, newOrders, inProgress, completed, todayOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: { $in: ['processing', 'ready_for_pickup', 'ready_for_delivery', 'driver_assigned', 'picked_up', 'in_transit'] } }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ createdAt: { $gte: today } })
    ]);

    return {
      total,
      new: newOrders,
      inProgress,
      completed,
      today: todayOrders
    };
  }

  // Send targeted notification to specific customer
  sendCustomerNotification(customerId, notification) {
    this.io.to(`customer_${customerId}`).emit('customer_notification', {
      ...notification,
      timestamp: new Date()
    });
  }

  // Send notification to all store owners
  sendStoreNotification(notification) {
    this.io.to('store_notifications').emit('store_notification', {
      ...notification,
      timestamp: new Date()
    });
  }

  // Cleanup method
  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('📡 Order polling stopped');
    }
  }
}

// Export singleton instance
const pollingRealTimeService = new PollingRealTimeService();
module.exports = pollingRealTimeService;

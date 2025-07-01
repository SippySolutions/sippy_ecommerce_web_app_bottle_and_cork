const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');

class RealTimeService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Track connected users
  }

  // Initialize Socket.IO and start change stream
  initialize(io) {
    this.io = io;
    this.setupSocketAuthentication();
    this.setupConnectionHandlers();
    this.startOrderChangeStream();
    console.log('🚀 Real-time service initialized');
  }

  // JWT authentication for Socket.IO connections
  setupSocketAuthentication() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Validate user exists
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return next(new Error('User not found'));
        }
        
        // Attach user info to socket
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

  // Setup connection and disconnection handlers
  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);
      
      // Track connected user
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        userName: socket.userName,
        userEmail: socket.userEmail,
        connectedAt: new Date()
      });

      // Join user to their personal room for targeted notifications
      socket.join(`customer_${socket.userId}`);
      
      // Join role-based rooms
      if (socket.userRole === 'customer') {
        socket.join('customers');
      } else if (socket.userRole === 'storeOwner' || socket.userRole === 'admin') {
        socket.join('store_notifications');
      }

      // Handle custom events
      socket.on('join_order_room', (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`User ${socket.userName} joined order room: ${orderId}`);
      });

      socket.on('leave_order_room', (orderId) => {
        socket.leave(`order_${orderId}`);
        console.log(`User ${socket.userName} left order room: ${orderId}`);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`❌ User disconnected: ${socket.userName} - Reason: ${reason}`);
        this.connectedUsers.delete(socket.userId);
      });

      // Send welcome message
      socket.emit('connection_status', {
        type: 'connected',
        message: 'Connected to real-time order updates',
        timestamp: new Date()
      });
    });
  }

  // Monitor MongoDB changes using Change Streams
  async startOrderChangeStream() {
    try {
      const changeStream = Order.watch([], { 
        fullDocument: 'updateLookup',
        fullDocumentBeforeChange: 'whenAvailable'
      });

      console.log('📡 Order change stream started');

      changeStream.on('change', async (change) => {
        try {
          await this.handleOrderChange(change);
        } catch (error) {
          console.error('Error handling order change:', error);
        }
      });

      changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
        // Attempt to restart change stream after a delay
        setTimeout(() => {
          console.log('Attempting to restart change stream...');
          this.startOrderChangeStream();
        }, 5000);
      });

    } catch (error) {
      console.error('Error starting change stream:', error);
    }
  }

  // Process different types of order changes
  async handleOrderChange(change) {
    const { operationType, fullDocument, documentKey } = change;
    
    console.log(`📬 Order change detected: ${operationType}`, {
      orderId: documentKey._id,
      newStatus: fullDocument?.status
    });

    switch (operationType) {
      case 'insert':
        await this.handleNewOrder(fullDocument);
        break;
      case 'update':
        await this.handleOrderUpdate(fullDocument, change);
        break;
      case 'delete':
        await this.handleOrderDeletion(documentKey._id);
        break;
    }
  }

  // Handle new order creation
  async handleNewOrder(order) {
    if (!order) return;

    // Populate order data
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price productimg')
      .populate('customer', 'firstName lastName email phone');

    // Emit to store owners/admins
    this.io.to('store_notifications').emit('order_notification', {
      type: 'new_order',
      order: populatedOrder,
      message: `New order #${order.orderNumber} received`,
      timestamp: new Date(),
      priority: 'high'
    });

    // Emit to specific customer
    if (order.customer) {
      this.io.to(`customer_${order.customer}`).emit('customer_order_update', {
        type: 'order_created',
        order: populatedOrder,
        message: `Your order #${order.orderNumber} has been placed successfully`,
        timestamp: new Date()
      });
    }

    // Emit general order update
    this.io.to(`order_${order._id}`).emit('single_order_update', {
      type: 'single_order_update',
      order: populatedOrder,
      operation: 'created',
      timestamp: new Date()
    });

    console.log(`📨 New order notifications sent for order: ${order.orderNumber}`);
  }

  // Handle order updates (status changes, etc.)
  async handleOrderUpdate(order, change) {
    if (!order) return;

    // Get the updated fields
    const updatedFields = change.updateDescription?.updatedFields || {};
    
    // Populate order data
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price productimg')
      .populate('customer', 'firstName lastName email phone');

    // Check if status was updated
    if (updatedFields.status) {
      const newStatus = updatedFields.status;
      const statusMessage = this.getStatusMessage(newStatus, order.orderNumber);

      // Emit to store owners/admins
      this.io.to('store_notifications').emit('order_notification', {
        type: 'order_update',
        order: populatedOrder,
        message: `Order #${order.orderNumber} status updated to ${newStatus}`,
        timestamp: new Date(),
        priority: this.getStatusPriority(newStatus),
        changes: {
          updatedFields
        }
      });

      // Emit to specific customer
      if (order.customer) {
        this.io.to(`customer_${order.customer}`).emit('customer_order_update', {
          type: 'order_status_update',
          order: populatedOrder,
          message: statusMessage,
          timestamp: new Date(),
          previousStatus: change.fullDocumentBeforeChange?.status,
          newStatus: newStatus
        });

        // Send delivery tracking updates for specific statuses
        if (['in_transit', 'ready_for_delivery', 'driver_assigned'].includes(newStatus)) {
          this.io.to(`customer_${order.customer}`).emit('delivery_update', {
            type: 'delivery_tracking_update',
            orderId: order._id,
            status: newStatus,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            orderType: order.orderType
          });
        }
      }
    }

    // Emit general order update
    this.io.to(`order_${order._id}`).emit('single_order_update', {
      type: 'single_order_update',
      order: populatedOrder,
      operation: 'updated',
      timestamp: new Date(),
      changes: updatedFields
    });

    console.log(`🔄 Order update notifications sent for order: ${order.orderNumber}`);
  }

  // Handle order deletion
  async handleOrderDeletion(orderId) {
    // Emit to all relevant rooms
    this.io.to('store_notifications').emit('order_notification', {
      type: 'order_deleted',
      orderId: orderId,
      message: 'An order has been deleted',
      timestamp: new Date(),
      priority: 'medium'
    });

    this.io.to(`order_${orderId}`).emit('single_order_update', {
      type: 'single_order_update',
      orderId: orderId,
      operation: 'deleted',
      timestamp: new Date()
    });

    console.log(`🗑️ Order deletion notifications sent for order: ${orderId}`);
  }

  // Get customer-friendly status messages
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

  // Get priority level for different statuses
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

  // Broadcast order statistics update
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

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
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
}

// Export singleton instance
const realTimeService = new RealTimeService();
module.exports = realTimeService;

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
// const cmsDataRoutes = require('./routes/CMSDataRoutes'); // Removed - using new CMS routes
const cmsRoutes = require('./routes/cmsRoutes'); // New CMS routes using MongoDB
const featuredproductRoutes = require('./routes/featuredproductRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const authRoutes = require('./routes/authRoutes');
const similarProductRoutes = require('./routes/similarProductRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const orderRoutes = require('./routes/orderRoutes'); // Import order routes
const checkoutRoutes = require('./routes/checkoutRoutes'); // Import checkout routes
const wishlistRoutes = require('./routes/wishlistRoutes'); // Import wishlist routes
const guestRoutes = require('./routes/guestRoutes'); // Import guest routes
const productGroupRoutes = require('./routes/productGroupRoutes'); // Import product group routes

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS - Updated to match store owner configuration
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      process.env.FRONTEND_URL,
      process.env.CUSTOMER_APP_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Socket.IO connection handling - Synchronized with store owner implementation
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join store owner room (for receiving order notifications)
  socket.join('store-owners');
  
  // Join customer room based on user authentication
  if (socket.userId) {
    socket.join(`customer_${socket.userId}`);
    console.log(`Customer ${socket.userId} joined their personal room`);
  }
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes and services
app.set('io', io);

app.use(cors());
app.use(express.json());

// Connect to MongoDB and setup Change Streams
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    setupOrderChangeStreams(); // Start monitoring
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Setup MongoDB Change Streams to watch for order changes - Synchronized with store owner
const setupOrderChangeStreams = () => {
  try {
    const Order = require('./models/Order');
    
    // Watch for changes in the orders collection
    const orderChangeStream = Order.watch([
      {
        $match: {
          'operationType': { $in: ['insert', 'update'] }
        }
      }
    ], { fullDocument: 'updateLookup' });

    console.log('MongoDB Change Streams initialized for orders collection');

    orderChangeStream.on('change', async (change) => {
      try {
        console.log('Order collection change detected:', change.operationType);
        
        if (change.operationType === 'insert') {
          // New order inserted
          const newOrder = change.fullDocument;
          console.log('New order inserted via Change Stream:', newOrder.orderNumber);
          
          // Populate customer data if needed
          await Order.populate(newOrder, { path: 'customer', select: 'firstName lastName email' });
          
          // Emit real-time notification to store owners
          io.to('store-owners').emit('newOrder', {
            order: newOrder,
            notification: {
              title: 'New Order Received!',
              message: `Order ${newOrder.orderNumber} from ${newOrder.shippingAddress?.firstName || 'Customer'} ${newOrder.shippingAddress?.lastName || ''}`,
              type: 'success',
              timestamp: new Date()
            }
          });
          
        } else if (change.operationType === 'update') {
          // Order updated
          const updatedOrder = change.fullDocument;
          console.log('Order updated via Change Stream:', updatedOrder.orderNumber, 'Status:', updatedOrder.status);
          
          // Only emit if status was changed
          if (change.updateDescription?.updatedFields?.status) {
            // Populate customer data if needed
            await Order.populate(updatedOrder, { path: 'customer', select: 'firstName lastName email' });
            
            // Emit to store owners
            io.to('store-owners').emit('orderStatusUpdated', {
              orderId: updatedOrder._id,
              orderNumber: updatedOrder.orderNumber,
              status: updatedOrder.status,
              order: updatedOrder
            });

            // Emit to customer
            if (updatedOrder.customer) {
              io.to(`customer_${updatedOrder.customer}`).emit('customer_order_update', {
                type: 'order_status_update',
                order: updatedOrder,
                message: getCustomerStatusMessage(updatedOrder.status, updatedOrder.orderNumber),
                timestamp: new Date(),
                newStatus: updatedOrder.status
              });
            }
          }
        }
      } catch (error) {
        console.error('Error processing order change stream event:', error);
      }
    });

    orderChangeStream.on('error', (error) => {
      console.error('Order change stream error:', error);
      // Attempt to restart change stream after a delay
      setTimeout(() => {
        console.log('Attempting to restart order change stream...');
        setupOrderChangeStreams();
      }, 5000);
    });
  } catch (error) {
    console.error('Failed to setup order change streams:', error);
  }
};

// Helper function for customer status messages
const getCustomerStatusMessage = (status, orderNumber) => {
  const messages = {
    'new': `Your order #${orderNumber} has been placed successfully and is being reviewed`,
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
};

// Routes
app.use('/api/products', productRoutes);
app.use('/api/featured-products', featuredproductRoutes);
app.use('/api/similar', similarProductRoutes);
// app.use('/api', cmsDataRoutes); // Removed - using new CMS routes instead
app.use('/api/cms-data', cmsRoutes); // New CMS data route using MongoDB
app.use('/api', departmentRoutes);
app.use('/api', authRoutes);
app.use('/api/users', userRoutes); // Register user routes
app.use('/api/orders', orderRoutes); // Register order routes
app.use('/api/checkout', checkoutRoutes); // Register checkout routes
app.use('/api/wishlist', wishlistRoutes); // Register wishlist routes
app.use('/api/guest', guestRoutes); // Register guest routes
app.use('/api/product-groups', productGroupRoutes); // Register product group routes

// Initialize real-time service
const realTimeService = require('./services/realTimeService');
realTimeService.initialize(io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO server initialized for real-time order updates');
});
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
// No longer importing connectDB - all requests use dynamic database connections
const productRoutes = require('./routes/productRoutes');
// const cmsDataRoutes = require('./routes/CMSDataRoutes'); // Removed - using new CMS routes
const cmsRoutes = require('./routes/cmsRoutes'); // New CMS routes using MongoDB
const featuredproductRoutes = require('./routes/featuredproductRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const similarProductRoutes = require('./routes/similarProductRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const orderRoutes = require('./routes/orderRoutes'); // Import order routes
const checkoutRoutes = require('./routes/checkoutRoutes'); // Import checkout routes
const wishlistRoutes = require('./routes/wishlistRoutes'); // Import wishlist routes
const guestRoutes = require('./routes/guestRoutes'); // Import guest routes
const productGroupRoutes = require('./routes/productGroupRoutes'); // Import product group routes
const databaseRoutes = require('./routes/databaseRoutes'); // Import database routes
const dbSwitcher = require('./middleware/dbSwitcher'); // Import database switcher middleware

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize database connection
const initializeApp = async () => {
  try {
    // Application initialized - multi-store backend ready
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Call initialization
initializeApp();

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
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Store-DB'],
    exposedHeaders: ['Set-Cookie']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Socket.IO connection handling - Synchronized with store owner implementation
io.on('connection', (socket) => {
  // New client connected

  // Join store owner room (for receiving order notifications)
  socket.join('store-owners');
  
  // Join customer room based on user authentication
  if (socket.userId) {
    socket.join(`customer_${socket.userId}`);
  }
  
  socket.on('disconnect', () => {
    // Client disconnected
  });
});

// Make io available to routes and services
app.set('io', io);

// Configure CORS to allow X-Store-DB header
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman, file://)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      process.env.FRONTEND_URL,
      process.env.CUSTOMER_APP_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Store-DB'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(express.json());

// Setup MongoDB Change Streams for a specific database - Called per database as needed
const setupOrderChangeStreams = (dbConnection, dbName) => {
  try {
    if (!dbConnection || !dbName) {
      return;
    }

    // Get the Order model for this specific database
    const Order = dbConnection.model('Order', require('./models/Order').schema);
    
    // Watch for changes in the orders collection for this database
    const orderChangeStream = Order.watch([
      {
        $match: {
          'operationType': { $in: ['insert', 'update'] }
        }
      }
    ], { fullDocument: 'updateLookup' });

    orderChangeStream.on('change', async (change) => {
      try {
        if (change.operationType === 'insert') {
          // New order inserted
          const newOrder = change.fullDocument;
          
          // Populate customer data if needed
          await Order.populate(newOrder, { path: 'customer', select: 'firstName lastName email' });
          
          // Emit real-time notification to store owners (include store info)
          io.to('store-owners').emit('newOrder', {
            order: newOrder,
            store: dbName,
            notification: {
              title: 'New Order Received!',
              message: `Order ${newOrder.orderNumber} from ${newOrder.shippingAddress?.firstName || 'Customer'} ${newOrder.shippingAddress?.lastName || ''} (${dbName})`,
              type: 'success',
              timestamp: new Date()
            }
          });
          
        } else if (change.operationType === 'update') {
          // Order updated
          const updatedOrder = change.fullDocument;
          
          // Only emit if status was changed
          if (change.updateDescription?.updatedFields?.status) {
            // Populate customer data if needed
            await Order.populate(updatedOrder, { path: 'customer', select: 'firstName lastName email' });
            
            // Emit to store owners (include store info)
            io.to('store-owners').emit('orderStatusUpdated', {
              orderId: updatedOrder._id,
              orderNumber: updatedOrder.orderNumber,
              status: updatedOrder.status,
              order: updatedOrder,
              store: dbName
            });

            // Emit to customer
            if (updatedOrder.customer) {
              io.to(`customer_${updatedOrder.customer}`).emit('customer_order_update', {
                type: 'order_status_update',
                order: updatedOrder,
                message: getCustomerStatusMessage(updatedOrder.status, updatedOrder.orderNumber),
                timestamp: new Date(),
                newStatus: updatedOrder.status,
                store: dbName
              });
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing order change stream event for ${dbName}:`, error);
      }
    });

    orderChangeStream.on('error', (error) => {
      console.error(`❌ Order change stream error for ${dbName}:`, error);
      // Attempt to restart change stream after a delay
      setTimeout(() => {
        setupOrderChangeStreams(dbConnection, dbName);
      }, 5000);
    });

    return orderChangeStream;
  } catch (error) {
    console.error(`❌ Failed to setup order change streams for ${dbName}:`, error);
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

// Routes - Apply dbSwitcher middleware to routes that need database access
app.use('/api/products', dbSwitcher, productRoutes);
app.use('/api/featured-products', dbSwitcher, featuredproductRoutes);
app.use('/api/similar', dbSwitcher, similarProductRoutes);
// app.use('/api', cmsDataRoutes); // Removed - using new CMS routes instead
app.use('/api/cms-data', dbSwitcher, cmsRoutes); // New CMS data route using MongoDB
app.use('/api', dbSwitcher, departmentRoutes);
app.use('/api', dbSwitcher, categoryRoutes);
app.use('/api', authRoutes); // Auth routes don't need database switching
app.use('/api/users', dbSwitcher, userRoutes); // Register user routes
app.use('/api/orders', dbSwitcher, orderRoutes); // Register order routes
app.use('/api/checkout', dbSwitcher, checkoutRoutes); // Register checkout routes
app.use('/api/wishlist', dbSwitcher, wishlistRoutes); // Register wishlist routes
app.use('/api/guest', dbSwitcher, guestRoutes); // Register guest routes
app.use('/api/product-groups', dbSwitcher, productGroupRoutes); // Register product group routes
app.use('/api/database', databaseRoutes); // Register database routes (doesn't need db switching)

// Initialize real-time service
const realTimeService = require('./services/realTimeService');
realTimeService.initialize(io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
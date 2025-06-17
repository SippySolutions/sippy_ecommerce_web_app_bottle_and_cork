const express = require('express');
const { getUserOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Optional auth middleware - checks for authentication but doesn't require it
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without authentication
      console.log('Invalid token, continuing as guest');
    }
  }
  
  next();
};

// Get user's orders (requires authentication)
router.get('/me', auth, getUserOrders);

// Get specific order by ID (supports both authenticated and guest access)
router.get('/:orderId', optionalAuth, getOrderById);

// Update order status (admin only - you might want to add admin middleware)
router.put('/:orderId/status', auth, updateOrderStatus);

module.exports = router;

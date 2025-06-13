const express = require('express');
const { getUserOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Get user's orders
router.get('/me', auth, getUserOrders);

// Get specific order by ID
router.get('/:orderId', auth, getOrderById);

// Update order status (admin only - you might want to add admin middleware)
router.put('/:orderId/status', auth, updateOrderStatus);

module.exports = router;

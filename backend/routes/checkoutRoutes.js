const express = require('express');
const { 
  processPayment,
  processPaymentWithSavedCard,
  createCustomerProfile,
  addPaymentMethod,
  deletePaymentMethod,
  validatePaymentMethods,
  syncPaymentMethods,
  getPaymentHistory,
  refundTransaction,
  authorizePayment
} = require('../controllers/checkoutController');
const authMiddleware = require('../middleware/authMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/checkout/process - Process payment with new card
router.post('/process', authMiddleware, processPayment);

// POST /api/checkout/process-saved-card - Process payment with saved card
router.post('/process-saved-card', authMiddleware, processPaymentWithSavedCard);

// POST /api/checkout/create-profile - Create customer profile
router.post('/create-profile', authMiddleware, createCustomerProfile);

// POST /api/checkout/add-payment-method - Add payment method to profile
router.post('/add-payment-method', authMiddleware, addPaymentMethod);

// DELETE /api/checkout/payment-method/:paymentMethodId - Delete payment method
router.delete('/payment-method/:paymentMethodId', authMiddleware, deletePaymentMethod);

// POST /api/checkout/validate-payment-methods - Validate payment methods
router.post('/validate-payment-methods', authMiddleware, validatePaymentMethods);

// POST /api/checkout/sync-payment-methods - Sync payment methods with Authorize.Net
router.post('/sync-payment-methods', authMiddleware, syncPaymentMethods);

// GET /api/checkout/payment-history - Get payment history
router.get('/payment-history', authMiddleware, getPaymentHistory);

// POST /api/checkout/refund - Refund transaction
router.post('/refund', authMiddleware, refundTransaction);

// Authorization workflow endpoints
// POST /api/checkout/authorize - Authorize payment (put on hold) - supports both logged in and guest users
router.post('/authorize', optionalAuth, authorizePayment);

module.exports = router;
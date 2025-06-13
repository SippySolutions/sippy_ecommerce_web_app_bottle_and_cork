const express = require('express');
const { 
  processPayment,
  processPaymentWithSavedCard,
  createCustomerProfile,
  addPaymentMethod,
  deletePaymentMethod,
  validatePaymentMethods,
  getPaymentHistory,
  refundTransaction
} = require('../controllers/checkoutController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/checkout/process - Process payment with new card
router.post('/process', authMiddleware, processPayment);

// POST /api/checkout/process-saved-card - Process payment with saved card
router.post('/process-saved-card', authMiddleware, processPaymentWithSavedCard);

// POST /api/checkout/create-profile - Create customer profile
router.post('/create-profile', authMiddleware, createCustomerProfile);

// POST /api/checkout/add-payment-method - Add payment method to profile
router.post('/add-payment-method', authMiddleware, addPaymentMethod);

// DELETE /api/checkout/delete-payment-method - Delete payment method
router.delete('/delete-payment-method', authMiddleware, deletePaymentMethod);

// POST /api/checkout/validate-payment-methods - Validate payment methods
router.post('/validate-payment-methods', authMiddleware, validatePaymentMethods);

// GET /api/checkout/payment-history - Get payment history
router.get('/payment-history', authMiddleware, getPaymentHistory);

// POST /api/checkout/refund - Refund transaction
router.post('/refund', authMiddleware, refundTransaction);

module.exports = router;
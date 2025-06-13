// filepath: apps/webApp/backend/routes/userRoutes.js
const express = require('express');
const {
  getUserProfile, updateUserDetails, deleteUser,
  addAddress, updateAddress, deleteAddress,
  addBillingMethod, updateBillingMethod, deleteBillingMethod
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/me', auth, getUserProfile);
router.put('/me', auth, updateUserDetails);
router.delete('/me', auth, deleteUser);

// Address routes
router.post('/me/addresses', auth, addAddress);
router.put('/me/addresses/:addressId', auth, updateAddress);
router.delete('/me/addresses/:addressId', auth, deleteAddress);

// Billing routes
router.post('/me/billing', auth, addBillingMethod);
router.put('/me/billing/:billingId', auth, updateBillingMethod);
router.delete('/me/billing/:billingId', auth, deleteBillingMethod);

module.exports = router;
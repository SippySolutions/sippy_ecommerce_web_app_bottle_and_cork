// filepath: apps/webApp/backend/routes/userRoutes.js
const express = require('express');
const {
  getUserProfile, updateUserDetails, deleteUser,
  addAddress, updateAddress, deleteAddress
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Database switching middleware is already applied in server.js
// No need to apply it again here

router.get('/me', auth, getUserProfile);
router.put('/me', auth, updateUserDetails);
router.delete('/me', auth, deleteUser);

// Address routes
router.post('/me/addresses', auth, addAddress);
router.put('/me/addresses/:addressId', auth, updateAddress);
router.delete('/me/addresses/:addressId', auth, deleteAddress);

// LEGACY BILLING ROUTES REMOVED - Use /checkout/* endpoints instead

module.exports = router;
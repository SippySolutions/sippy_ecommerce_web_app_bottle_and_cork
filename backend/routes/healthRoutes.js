// Backend health check endpoint for debugging payment functionality
// Add this to your backend routes for debugging

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/health/payment-config - Check payment configuration
router.get('/payment-config', (req, res) => {
  try {
    const config = {
      hasAuthorizeNetConfig: !!(process.env.AUTHORIZE_NET_API_LOGIN_ID && process.env.AUTHORIZE_NET_TRANSACTION_KEY),
      nodeEnv: process.env.NODE_ENV,
      jwtSecret: !!process.env.JWT_SECRET,
      mongoConnected: require('mongoose').connection.readyState === 1,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Payment configuration status',
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking payment configuration',
      error: error.message
    });
  }
});

// GET /api/health/user-billing - Check user billing data (requires auth)
router.get('/user-billing', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User billing data',
      data: {
        userId: user._id,
        hasBilling: !!user.billing,
        billingCount: user.billing ? user.billing.length : 0,
        hasAuthorizeNetProfile: !!user.authorizeNetCustomerProfileId,
        billing: user.billing || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking user billing',
      error: error.message
    });
  }
});

module.exports = router;

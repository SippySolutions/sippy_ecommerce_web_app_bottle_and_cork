const express = require('express');
const router = express.Router();
const { processGuestPayment } = require('../controllers/guestController');

// Process guest checkout
router.post('/checkout', processGuestPayment);

module.exports = router;

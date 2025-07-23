
const express = require('express');
const dbSwitcher = require('../middleware/dbSwitcher');
const {
    fetchFeaturedProducts, // Import the controller
  } = require('../controllers/FeturedProductRController');
const router = express.Router();

router.get('/:type', dbSwitcher, fetchFeaturedProducts); // Ensure this route is defined
module.exports = router;
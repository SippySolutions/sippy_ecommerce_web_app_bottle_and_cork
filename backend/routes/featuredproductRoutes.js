
const express = require('express');
const {
    fetchFeaturedProducts, // Import the controller
  } = require('../controllers/FeturedProductRController');
const router = express.Router();

router.get('/:type', fetchFeaturedProducts); // Ensure this route is defined
module.exports = router;
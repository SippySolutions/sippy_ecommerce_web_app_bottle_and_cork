const express = require('express');
const {fetchSimilarProducts// Import the new controller
} = require('../controllers/SimilarProductController');
const router = express.Router();

router.get('/', fetchSimilarProducts); // Add the new route for similar products

module.exports = router;
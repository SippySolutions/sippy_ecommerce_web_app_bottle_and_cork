const express = require('express');
const {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getSimilarProducts,
  searchProducts,
  getSearchSuggestions
} = require('../controllers/ProductContorller');
const router = express.Router();

// Database switching middleware is already applied in server.js

// Search routes - put these before other routes to avoid conflicts
router.get('/search', searchProducts);
router.get('/search/suggestions', getSearchSuggestions);

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/featured', getFeaturedProducts);

module.exports = router;
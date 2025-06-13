const express = require('express');
const {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getSimilarProducts, // Import the new controller
} = require('../controllers/ProductContorller');
const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/featured', getFeaturedProducts); // Add the new route for similar products

module.exports = router;
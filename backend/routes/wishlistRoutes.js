const express = require('express');
const { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist,
  isInWishlist 
} = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Database switching middleware is already applied in server.js
// All routes require authentication
router.use(authMiddleware);

// GET /api/wishlist - Get user's wishlist
router.get('/', getWishlist);

// POST /api/wishlist - Add product to wishlist
router.post('/', addToWishlist);

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

// DELETE /api/wishlist - Clear entire wishlist
router.delete('/', clearWishlist);

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get('/check/:productId', isInWishlist);

module.exports = router;

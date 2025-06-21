const express = require('express');
const router = express.Router();
const {
  getProductGroups,
  getProductGroupById,
  getProductsByGroupId,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  debugProductsByIds
} = require('../controllers/productGroupController');

// Public routes
router.get('/', getProductGroups);
router.get('/:id', getProductGroupById);
router.get('/:id/products', getProductsByGroupId);

// Admin routes (add authentication middleware as needed)
router.post('/', createProductGroup);
router.put('/:id', updateProductGroup);
router.delete('/:id', deleteProductGroup);

// Debug routes
router.post('/debug/products', debugProductsByIds);

module.exports = router;

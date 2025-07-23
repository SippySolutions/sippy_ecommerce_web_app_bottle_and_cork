const express = require('express');
const dbSwitcher = require('../middleware/dbSwitcher');
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
router.get('/', dbSwitcher, getProductGroups);
router.get('/:id', dbSwitcher, getProductGroupById);
router.get('/:id/products', dbSwitcher, getProductsByGroupId);

// Admin routes (add authentication middleware as needed)
router.post('/', dbSwitcher, createProductGroup);
router.put('/:id', dbSwitcher, updateProductGroup);
router.delete('/:id', dbSwitcher, deleteProductGroup);

// Debug routes
router.post('/debug/products', dbSwitcher, debugProductsByIds);

module.exports = router;

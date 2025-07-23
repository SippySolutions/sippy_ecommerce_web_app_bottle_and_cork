const express = require('express');
const dbSwitcher = require('../middleware/dbSwitcher');

const router = express.Router();

// Route to get categories - now uses categories collection directly
router.get('/categories', dbSwitcher, async (req, res) => {
  try {
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const categoriesCollection = db.collection('categories');
    
    // Get all active categories sorted by sortOrder and level
    const categories = await categoriesCollection
      .find({ isActive: true })
      .sort({ level: 1, sortOrder: 1, name: 1 })
      .toArray();
    
    // Build hierarchical structure
    const categoriesMap = new Map();
    const rootCategories = [];
    
    // First pass: create all category objects
    categories.forEach(category => {
      categoriesMap.set(category._id.toString(), {
        _id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        level: category.level,
        sortOrder: category.sortOrder,
        parent: category.parent,
        subcategories: []
      });
    });
    
    // Second pass: build hierarchy
    categories.forEach(category => {
      const categoryObj = categoriesMap.get(category._id.toString());
      
      if (category.parent) {
        // This is a subcategory, add it to its parent
        const parentId = category.parent.toString();
        const parent = categoriesMap.get(parentId);
        if (parent) {
          parent.subcategories.push(categoryObj);
        }
      } else {
        // This is a root category
        rootCategories.push(categoryObj);
      }
    });
    
    res.json(rootCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
});

module.exports = router;

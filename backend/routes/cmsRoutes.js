const express = require('express');
const dbSwitcher = require('../middleware/dbSwitcher');
const router = express.Router();

// GET /api/cms-data - Get CMS data from database
router.get('/', dbSwitcher, async (req, res) => {
  try {
    // Use the connection to get the native database and access cms collection
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const cmsCollection = db.collection('cms');
    
    // Find the first (and should be only) CMS document
    const cmsData = await cmsCollection.findOne();
    
    if (!cmsData) {
      return res.status(404).json({
        success: false,
        message: 'CMS data not found',
        data: null
      });
    }
    
    res.json(cmsData); // Return data directly to match existing frontend expectations
    
  } catch (error) {
    console.error(`❌ Error fetching CMS data from ${req.dbName}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching CMS data',
      error: error.message
    });
  }
});

// PUT /api/cms-data - Update CMS configuration (for admin panel)
router.put('/', dbSwitcher, async (req, res) => {
  try {
    // Use the connection to get the native database and access cms collection
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const cmsCollection = db.collection('cms');
    
    // Update the first (and should be only) CMS document, or create if it doesn't exist
    const updatedCMS = await cmsCollection.findOneAndUpdate(
      {}, // Find any document (there should only be one)
      { $set: req.body }, // Update with the request body
      { 
        returnDocument: 'after', // Return the updated document
        upsert: true // Create if it doesn't exist
      }
    );
    
    res.json({
      success: true,
      message: 'CMS data updated successfully',
      data: updatedCMS.value
    });
    
  } catch (error) {
    console.error(`❌ Error updating CMS data in ${req.dbName}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error updating CMS data',
      error: error.message
    });
  }
});

module.exports = router;

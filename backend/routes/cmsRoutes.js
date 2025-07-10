const express = require('express');
const router = express.Router();
const CMS = require('../models/CMSdata'); // Updated to use new model

// GET /api/cms-data - Get CMS data from database
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching CMS data from cms collection...');
    
    // Find the first (and should be only) CMS document
    const cmsData = await CMS.findOne();
    
    if (!cmsData) {
      console.log('⚠️ No CMS data found, returning 404');
      return res.status(404).json({
        success: false,
        message: 'CMS data not found',
        data: null
      });
    }
    
    console.log('✅ CMS data found and returned');
    res.json(cmsData); // Return data directly to match existing frontend expectations
    
  } catch (error) {
    console.error('❌ Error fetching CMS data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching CMS data',
      error: error.message
    });
  }
});

// PUT /api/cms-data - Update CMS configuration (for admin panel)
router.put('/', async (req, res) => {
  try {
    console.log('📝 Updating CMS data in cms collection...');
    
    // Update the first (and should be only) CMS document, or create if it doesn't exist
    const updatedCMS = await CMS.findOneAndUpdate(
      {}, // Find any document (there should only be one)
      req.body, // Update with the request body
      { 
        new: true, // Return the updated document
        upsert: true, // Create if it doesn't exist
        runValidators: true // Run schema validation
      }
    );
    
    console.log('✅ CMS data updated successfully');
    res.json({
      success: true,
      message: 'CMS data updated successfully',
      data: updatedCMS
    });
    
  } catch (error) {
    console.error('❌ Error updating CMS data:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating CMS data',
      error: error.message
    });
  }
});

module.exports = router;

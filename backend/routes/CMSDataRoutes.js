
const express = require("express");
const dbSwitcher = require('../middleware/dbSwitcher');

const router = express.Router();

// GET /api/cms-data - Fetch CMS Data
router.get("/cms-data", dbSwitcher, async (req, res) => {
  try {
    // Get database connection from middleware
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const cmsCollection = db.collection('cms_data');
    
    // Fetch the first document using native MongoDB driver
    const cmsData = await cmsCollection.findOne({});
    
    if (!cmsData) {
      return res.status(404).json({ message: "CMS data not found" });
    }
    res.json(cmsData);
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    res.status(500).json({ message: "Error fetching CMS data", error: error.message });
  }
});

module.exports = router;
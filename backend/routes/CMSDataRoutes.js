
const express = require("express");
const CMSData = require("../models/CMSdata"); // Fix case sensitivity - 'CMSdata' not 'CMSData'

const router = express.Router();

// GET /api/cms-data - Fetch CMS Data
router.get("/cms-data", async (req, res) => {
  try {
    const cmsData = await CMSData.findOne(); // Fetch the first document
    if (!cmsData) {
      return res.status(404).json({ message: "CMS data not found" });
    }
    res.json(cmsData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching CMS data", error });
  }
});

module.exports = router;
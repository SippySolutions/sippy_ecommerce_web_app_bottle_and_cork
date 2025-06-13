// filepath: p:\SIPPY\PROJECTS\Ecomm\multi-tenant-ecommerce\ecom-monorepo\apps\ecombackend\controllers\CMSDataController.js

const CMSData = require("../models/CMSdata");

// Fetch CMS Data
exports.getCMSData = async (req, res) => {
  try {
    const cmsData = await CMSData.findOne(); // Fetch the first document
    if (!cmsData) {
      return res.status(404).json({ message: "CMS data not found" });
    }
    res.json(cmsData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching CMS data", error });
  }
};
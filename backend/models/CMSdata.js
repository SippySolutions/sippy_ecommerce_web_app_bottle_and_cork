// filepath: p:\SIPPY\PROJECTS\Ecomm\multi-tenant-ecommerce\ecom-monorepo\apps\ecombackend\models\CMSData.js

const mongoose = require("mongoose");

const storeInfoSchema = new mongoose.Schema({
  name: String,
  owner: mongoose.Schema.Types.ObjectId,
  address: String,
  status: String,
  isDeleted: Boolean,
  email: String,
  phone: String,
  tax: {
    type: Object, // or define a sub-schema for more structure
    default: {},
  },
}, { _id: false });

const cmsDataSchema = new mongoose.Schema({
  heroSection: Object,
  bestSellers: Array,
  categories: Array,
  exclusive: Object,
  staffPick: Object,
  banner: Object,
  brandBanner: Array,
  theme: Object,
  storeInfo: storeInfoSchema, // <-- use the new schema
});

// Explicitly define the collection name

module.exports = mongoose.model("CMSData", cmsDataSchema, "cmsData");
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
  storeHours: Object,
  tax: {
    type: Object,
    default: {},
  },
  bag: Number,
  delivery: {
    fee: Number,
    under: Number
  }
}, { _id: false });

// Promo banner schema with action support
const promoBannerItemSchema = new mongoose.Schema({
  image: String,
  action: String, // 'products', 'product-group', 'brand', etc.
  group_id: mongoose.Schema.Types.ObjectId, // For product-group navigation
  brand: String, // For brand navigation
  title: String, // Optional title for banner
  subtitle: String, // Optional subtitle for banner
  buttonText: String // Optional button text
}, { _id: false });

const promoBannerSchema = new mongoose.Schema({
  promo_1: promoBannerItemSchema,
  promo_2: promoBannerItemSchema,
  promo_3: promoBannerItemSchema
}, { _id: false });

const cmsDataSchema = new mongoose.Schema({
  logo: String,
  heroSection: Object,
  bestSellers: Array,
  categories: Array,
  exclusive: Object,
  staffPick: Object,
  banner: Object,
  brandBanner: Array,
  theme: Object,
  storeInfo: storeInfoSchema,
  promo_banner: promoBannerSchema // Add promo banner with action support
});

// Explicitly define the collection name

module.exports = mongoose.model("CMSData", cmsDataSchema, "cmsData");
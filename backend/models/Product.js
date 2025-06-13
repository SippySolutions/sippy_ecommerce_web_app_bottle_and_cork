const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    upc: { type: String, unique: true, sparse: true },
    sku: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    size: { type: String },
    pack: { type: String },
    vintage: { type: String },
    brand: { type: String },
    vendor: { type: String },
    department: { type: String },
    category: { type: String },
    subcategory: { type: String },
    country: { type: String },
    region: { type: String },
    productimg: { type: String },
    abv: { type: String },
    price: { type: Number, required: true },
    totalqty: { type: Number },
    storeid: { type: String },
    saleprice: { type: Number },
    exclusive: { type: Boolean, default: false },
    staffPick: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
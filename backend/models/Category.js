const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 2 // 0: Department, 1: Category, 2: Subcategory
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better performance
categorySchema.index({ level: 1, isActive: 1, sortOrder: 1 });
categorySchema.index({ parent: 1, isActive: 1, sortOrder: 1 });
categorySchema.index({ name: 1, level: 1 });

// Virtual for getting children
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });

// Specify the exact collection name
module.exports = mongoose.model('Category', categorySchema, 'categories');

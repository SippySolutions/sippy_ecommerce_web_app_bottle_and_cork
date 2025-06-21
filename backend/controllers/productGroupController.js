const ProductGroup = require('../models/ProductGroup');
const Product = require('../models/Product');

// Get all active product groups
exports.getProductGroups = async (req, res) => {
  try {
    const productGroups = await ProductGroup.find({ isActive: true })
      .populate('products')
      .sort({ displayOrder: 1, createdAt: -1 });
    
    res.json(productGroups);
  } catch (error) {
    console.error('Error fetching product groups:', error);
    res.status(500).json({ message: 'Error fetching product groups', error: error.message });
  }
};

// Get a single product group by ID
exports.getProductGroupById = async (req, res) => {
  try {    const { id } = req.params;
    
    const productGroup = await ProductGroup.findById(id)
      .populate({
        path: 'products',
        select: 'name price productimg', // Use correct field names from Product model
        options: { limit: 5 } // Limit to first 5 products for the group info
      });
    
    if (!productGroup) {
      return res.status(404).json({ message: 'Product group not found' });
    }
    
    if (!productGroup.isActive) {
      return res.status(404).json({ message: 'Product group is not active' });
    }
    
    res.json(productGroup);
  } catch (error) {
    console.error('Error fetching product group:', error);
    res.status(500).json({ message: 'Error fetching product group', error: error.message });
  }
};

// Get products by group ID
exports.getProductsByGroupId = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
    
    const productGroup = await ProductGroup.findById(id);
    
    if (!productGroup) {
      return res.status(404).json({ message: 'Product group not found' });
    }
    
    if (!productGroup.isActive) {
      return res.status(404).json({ message: 'Product group is not active' });
    }
    
    // Create sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);    // Get products from the group
    const products = await Product.find({ 
      _id: { $in: productGroup.products }
    })
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments({ 
      _id: { $in: productGroup.products }
    });
    
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    
    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProducts,
        totalPages
      },
      group: {
        id: productGroup._id,
        name: productGroup.name,
        description: productGroup.description,
        bannerImage: productGroup.bannerImage
      }
    });
  } catch (error) {
    console.error('Error fetching products by group:', error);
    res.status(500).json({ message: 'Error fetching products by group', error: error.message });
  }
};

// Create a new product group (admin only)
exports.createProductGroup = async (req, res) => {
  try {
    const { name, description, bannerImage, products, displayOrder } = req.body;
    
    const productGroup = new ProductGroup({
      name,
      description,
      bannerImage,
      products: products || [],
      displayOrder: displayOrder || 0
    });
    
    await productGroup.save();
    
    res.status(201).json(productGroup);
  } catch (error) {
    console.error('Error creating product group:', error);
    res.status(500).json({ message: 'Error creating product group', error: error.message });
  }
};

// Update a product group (admin only)
exports.updateProductGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const productGroup = await ProductGroup.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!productGroup) {
      return res.status(404).json({ message: 'Product group not found' });
    }
    
    res.json(productGroup);
  } catch (error) {
    console.error('Error updating product group:', error);
    res.status(500).json({ message: 'Error updating product group', error: error.message });
  }
};

// Delete a product group (admin only)
exports.deleteProductGroup = async (req, res) => {
  try {
    const { id } = req.params;
    
    const productGroup = await ProductGroup.findByIdAndDelete(id);
    
    if (!productGroup) {
      return res.status(404).json({ message: 'Product group not found' });
    }
    
    res.json({ message: 'Product group deleted successfully' });
  } catch (error) {
    console.error('Error deleting product group:', error);
    res.status(500).json({ message: 'Error deleting product group', error: error.message });
  }
};

// Debug endpoint to check products by IDs
exports.debugProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body; // Array of product IDs
    
    console.log('Checking products with IDs:', ids);
    
    const products = await Product.find({ _id: { $in: ids } });
    console.log('Found products:', products.length);
    
    const foundIds = products.map(p => p._id.toString());
    const missingIds = ids.filter(id => !foundIds.includes(id.toString()));
    
    res.json({
      requestedIds: ids,
      foundProducts: products.length,
      foundIds: foundIds,
      missingIds: missingIds,
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        productimg: p.productimg
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
};

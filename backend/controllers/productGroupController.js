const { ObjectId } = require('mongodb');

// Helper function to get models for specific database connection
const getModels = (connection) => {
  try {
    const ProductGroup = connection.model('ProductGroup');
    const Product = connection.model('Product');
    return { ProductGroup, Product };
  } catch (error) {
    console.error('Error getting models:', error);
    throw error;
  }
};

// Get all active product groups
exports.getProductGroups = async (req, res) => {
  try {
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const productGroupsCollection = db.collection('productgroups');
    
    // Simple query without sorting for now
    const productGroups = await productGroupsCollection
      .find({ isActive: true })
      .toArray();
    
    res.json(productGroups);
  } catch (error) {
    console.error('Error fetching product groups:', error);
    // Return empty array to prevent frontend crashes
    res.json([]);
  }
};

// Get a single product group by ID
exports.getProductGroupById = async (req, res) => {
  try {
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product group ID' });
    }
    
    const productGroupsCollection = db.collection('productgroups');
    const productsCollection = db.collection('products');
    
    // Find the product group
    const productGroup = await productGroupsCollection.findOne({ 
      _id: new ObjectId(id),
      isActive: true 
    });
    
    if (!productGroup) {
      return res.status(404).json({ message: 'Product group not found' });
    }
    
    // Get first 5 products for this group (for preview)
    const products = await productsCollection
      .find({ 
        _id: { $in: (productGroup.products || []).map(pid => new ObjectId(pid)) }
      })
      .project({ name: 1, price: 1, productimg: 1 })
      .limit(5)
      .toArray();
    
    // Add products to the response
    const result = {
      ...productGroup,
      products: products
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching product group:', error);
    res.status(500).json({ message: 'Error fetching product group', error: error.message });
  }
};

// Get products by group ID
exports.getProductsByGroupId = async (req, res) => {
  try {
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const { id } = req.params;
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product group ID' });
    }
    
    const productGroupsCollection = db.collection('productgroups');
    const productsCollection = db.collection('products');
    
    // Find the product group
    const productGroup = await productGroupsCollection.findOne({ 
      _id: new ObjectId(id),
      isActive: true 
    });
    
    if (!productGroup) {
      return res.status(404).json({ message: 'Product group not found' });
    }
    
    // Create sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Convert product IDs to ObjectIds
    const productIds = (productGroup.products || []).map(pid => new ObjectId(pid));
    
    // Get products from the group with pagination
    const [products, totalProducts] = await Promise.all([
      productsCollection
        .find({ _id: { $in: productIds } })
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      productsCollection.countDocuments({ _id: { $in: productIds } })
    ]);
    
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
    const { ProductGroup } = getModels(req.dbConnection);
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
    const { ProductGroup } = getModels(req.dbConnection);
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
    const { ProductGroup } = getModels(req.dbConnection);
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
    const { Product } = getModels(req.dbConnection);
    const { ids } = req.body; // Array of product IDs
    
    const products = await Product.find({ _id: { $in: ids } });
    
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

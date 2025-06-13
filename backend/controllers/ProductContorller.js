const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const { type } = req.query;

    // Validate the type parameter
    if (!['bestseller', 'exclusive', 'staffPick'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Allowed values are bestseller, exclusive, staffPick.' });
    }

    // Build the query dynamically based on the type
    const query = { bestseller: true };

    console.log('Fetching products with query:', query); // Debug log

    // Fetch products based on the query
    const products = await Product.find(query);

    console.log('Products found:', products); // Debug log

    // Check if any products were found
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for the specified type.' });
    }

    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching featured products:', error.message); // Debug log
    res.status(500).json({ message: 'Failed to fetch featured products', error: error.message });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts, // Export the updated controller
};
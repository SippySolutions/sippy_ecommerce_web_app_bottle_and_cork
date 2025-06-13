const Product = require('../models/Product');

const fetchFeaturedProducts = async (req, res) => {
  try {
    const { type } = req.params; // Use req.params to get the type from the URL

    // Validate the type parameter
    if (!['bestseller', 'exclusive', 'staffPick'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Allowed values are bestseller, exclusive, staffPick.',type });
    }

    // Build the query dynamically based on the type
    const query = { [type]: true };

    // Fetch products based on the query                                                                           
    const products = await Product.find(query);


    // Check if any products were found
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for the specified type.' });
    }

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch featured products', error: error.message });
  }
};

module.exports = { fetchFeaturedProducts };
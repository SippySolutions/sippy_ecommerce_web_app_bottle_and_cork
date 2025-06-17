const Product = require('../models/Product');

const fetchSimilarProducts = async (req, res) => {
  try {
    const { department, category, subcategory, priceRange } = req.query;

    // Validate required parameters
    if (!department || !priceRange) {
      return res.status(400).json({ error: 'Department and price range are required.' });
    }

    // Parse the price range
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);

    // Build the query
    const query = {
      department,
      price: { $gte: minPrice, $lte: maxPrice }, // Price range
    };

    // Add category and subcategory to the query only if they are provided and not 'undefined'
    if (category && category !== 'undefined' && category.trim() !== '') {
      query.category = category;
    }
    if (subcategory && subcategory !== 'undefined' && subcategory.trim() !== '') {
      query.subcategory = subcategory;
    }

    console.log('Similar products query:', query); // Debug log

    // Fetch similar products
    const similarProducts = await Product.find(query).limit(10); // Limit to 10 products

    if (!similarProducts || similarProducts.length === 0) {
      return res.status(404).json({ message: 'No similar products found.' });
    }

    res.json({ success: true, products: similarProducts });
  } catch (error) {
    console.error('Error fetching similar products:', error.message);
    res.status(500).json({ message: 'Failed to fetch similar products', error: error.message });
  }
};

module.exports = { fetchSimilarProducts };
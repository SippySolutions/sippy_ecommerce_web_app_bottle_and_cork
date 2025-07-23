const fetchFeaturedProducts = async (req, res) => {
  try {
    const { type } = req.params; // Use req.params to get the type from the URL

    // Validate the type parameter
    if (!['bestseller', 'exclusive', 'staffpick'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Allowed values are bestseller, exclusive, staffpick.',type });
    }

    // Get database connection from middleware
    if (!req.dbConnection) {
      throw new Error('Database connection not available from middleware');
    }
    
    // Debug: Check what properties are available on the connection
    console.error('Debug - req.dbConnection properties:', Object.keys(req.dbConnection));
    console.error('Debug - req.dbConnection.db exists:', !!req.dbConnection.db);
    
    // Try to get the native database object
    const db = req.dbConnection.db || req.dbConnection;
    if (!db || !db.collection) {
      console.error('Debug - db object:', db);
      console.error('Debug - db has collection method:', !!(db && db.collection));
      throw new Error('Database object does not support collection method');
    }
    
    const productsCollection = db.collection('products');

    // Build the query dynamically based on the type
    const query = { [type]: true };

    // Fetch products based on the query using native MongoDB driver                                                                          
    const products = await productsCollection.find(query).toArray();

    // Check if any products were found
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for the specified type.' });
    }

    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Failed to fetch featured products', error: error.message });
  }
};

module.exports = { fetchFeaturedProducts };
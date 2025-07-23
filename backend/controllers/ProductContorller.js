// Helper function to get models for specific database connection
const getModels = (connection) => {
  try {
    const Product = connection.model('Product');
    return { Product };
  } catch (error) {
    console.error('Error getting models:', error);
    throw error;
  }
};

const getAllProducts = async (req, res) => {
  try {
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const productsCollection = db.collection('products');
    
    // Exclude products where department is 'TOBACCO' (case-insensitive, any case)
    const products = await productsCollection
      .find({ department: { $not: { $regex: /^tobacco$/i } } })
      .toArray();
      
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const { ObjectId } = require('mongodb');
    const productsCollection = db.collection('products');
    
    // Validate ObjectId format
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const product = await productsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const { type } = req.query;

    // Validate the type parameter
    if (!['bestseller', 'exclusive', 'staffPick'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const productsCollection = db.collection('products');

    // Build the query based on the type
    let query = {};
    if (type === 'bestseller') {
      query.isBestseller = true;
    } else if (type === 'exclusive') {
      query.isExclusive = true;
    } else if (type === 'staffPick') {
      query.isStaffPick = true;
    }

    // Exclude products where department is 'TOBACCO' (case-insensitive, any case)
    query.department = { $not: { $regex: /^tobacco$/i } };

    const products = await productsCollection.find(query).toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Failed to fetch featured products', error: error.message });
  }
};

const getProductsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const productsCollection = db.collection('products');

    // Find products by department, excluding tobacco
    const products = await productsCollection.find({ 
      department: { $regex: new RegExp(department, 'i'), $not: { $regex: /^tobacco$/i } }
    }).toArray();
    
    // Check if any products were found
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for the specified department.' });
    }

    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products by department:', error.message);
    res.status(500).json({ message: 'Failed to fetch products by department', error: error.message });
  }
};

// Search products by name, SKU, department, category, subcategory
const searchProducts = async (req, res) => {
  try {
    const { 
      q, 
      department, 
      category, 
      subcategory, 
      categories,
      subcategories,
      packTypes,
      sizes,
      salesOffers,
      priceRanges,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Allow search with just filters (no query required)
    if (!q && !department && !category && !subcategory && 
        !categories && !subcategories && !packTypes && !sizes && !salesOffers && !priceRanges) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query or filter parameters required' 
      });
    }

    // Get database and collection using the database switching pattern
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const productsCollection = db.collection('products');

    // Build search criteria
    let searchCriteria = {
      // Always exclude tobacco department
      department: { $not: { $regex: /^tobacco$/i } }
    };
    
    // Text search across multiple fields
    if (q) {
      const searchRegex = new RegExp(q, 'i'); // Case-insensitive search
      searchCriteria.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { brand: searchRegex },
        { department: searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex }
      ];
    }

    // Single-value filters (URL-based)
    if (department) {
      // If filtering by department, still exclude tobacco but allow other departments
      if (department.toLowerCase() !== 'tobacco') {
        searchCriteria.department = { 
          $regex: new RegExp(department, 'i'), 
          $not: { $regex: /^tobacco$/i } 
        };
      } else {
        // If someone tries to search for tobacco specifically, return empty results
        return res.json({
          success: true,
          products: [],
          pagination: { page: 1, limit: parseInt(limit), total: 0, totalPages: 0 },
          searchQuery: q,
          filters: { department, category, subcategory },
          suggestions: { departments: [], categories: [], subcategories: [], brands: [] }
        });
      }
    }
    if (category) {
      searchCriteria.category = new RegExp(category, 'i');
    }
    if (subcategory) {
      searchCriteria.subcategory = new RegExp(subcategory, 'i');
    }

    // Multi-select filters (array-based)
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      if (categoryArray.length > 0) {
        searchCriteria.category = { $in: categoryArray.map(cat => new RegExp(cat, 'i')) };
      }
    }

    if (subcategories) {
      const subcategoryArray = Array.isArray(subcategories) ? subcategories : [subcategories];
      if (subcategoryArray.length > 0) {
        searchCriteria.subcategory = { $in: subcategoryArray.map(subcat => new RegExp(subcat, 'i')) };
      }
    }

    if (packTypes) {
      const packTypeArray = Array.isArray(packTypes) ? packTypes : [packTypes];
      if (packTypeArray.length > 0) {
        searchCriteria.packname = { $in: packTypeArray.map(pack => new RegExp(pack, 'i')) };
      }
    }

    if (sizes) {
      const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
      if (sizeArray.length > 0) {
        searchCriteria.size = { $in: sizeArray.map(size => new RegExp(size, 'i')) };
      }
    }

    if (salesOffers) {
      const offerArray = Array.isArray(salesOffers) ? salesOffers : [salesOffers];
      if (offerArray.length > 0) {
        // Handle different offer types
        const offerConditions = [];
        offerArray.forEach(offer => {
          switch (offer) {
            case 'On Sale':
              offerConditions.push({ saleprice: { $exists: true, $ne: null, $gt: 0 } });
              break;
            case 'Buy One Get One':
              offerConditions.push({ bogo: true });
              break;
            case 'Limited Time':
              offerConditions.push({ limitedTime: true });
              break;
            default:
              // Custom offer matching
              offerConditions.push({ offers: new RegExp(offer, 'i') });
              break;
          }
        });
        if (offerConditions.length > 0) {
          searchCriteria.$and = searchCriteria.$and || [];
          searchCriteria.$and.push({ $or: offerConditions });
        }
      }
    }

    if (priceRanges) {
      const priceArray = Array.isArray(priceRanges) ? priceRanges : [priceRanges];
      if (priceArray.length > 0) {
        const priceConditions = [];
        priceArray.forEach(range => {
          switch (range) {
            case '$0-$10':
              priceConditions.push({ price: { $gte: 0, $lte: 10 } });
              break;
            case '$10-$50':
              priceConditions.push({ price: { $gt: 10, $lte: 50 } });
              break;
            case '$50-$100':
              priceConditions.push({ price: { $gt: 50, $lte: 100 } });
              break;
            case '$100+':
              priceConditions.push({ price: { $gt: 100 } });
              break;
          }
        });
        if (priceConditions.length > 0) {
          searchCriteria.$and = searchCriteria.$and || [];
          searchCriteria.$and.push({ $or: priceConditions });
        }
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute search with pagination using native MongoDB driver
    const [products, totalCount] = await Promise.all([
      productsCollection
        .find(searchCriteria)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ name: 1 })
        .toArray(),
      productsCollection.countDocuments(searchCriteria)
    ]);

    // Get search suggestions using native MongoDB aggregation
    const suggestions = await productsCollection.aggregate([
      { 
        $match: { 
          ...searchCriteria,
          department: { $not: { $regex: /^tobacco$/i } } // Ensure tobacco is excluded from suggestions too
        } 
      },
      {
        $group: {
          _id: null,
          departments: { $addToSet: '$department' },
          categories: { $addToSet: '$category' },
          subcategories: { $addToSet: '$subcategory' },
          brands: { $addToSet: '$brand' }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      },
      searchQuery: q,
      filters: { 
        department, 
        category, 
        subcategory,
        categories,
        subcategories,
        packTypes,
        sizes,
        salesOffers,
        priceRanges
      },
      suggestions: suggestions[0] || { departments: [], categories: [], subcategories: [], brands: [] }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Search failed', 
      error: error.message 
    });
  }
};

// Get search suggestions for autocomplete
const getSearchSuggestions = async (req, res) => {
  try {
    const db = req.dbConnection.db;
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    const productsCollection = db.collection('products');
    const { q, type = 'all' } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const searchRegex = new RegExp(q, 'i');
    let suggestions = [];

    // Base filter to exclude tobacco department
    const baseFilter = { department: { $not: { $regex: /^tobacco$/i } } };

    switch (type) {
      case 'products':
        suggestions = await productsCollection.find(
          { 
            name: searchRegex,
            ...baseFilter
          },
          { 
            projection: {
              name: 1, 
              sku: 1, 
              brand: 1, 
              productimg: 1, 
              size: 1, 
              packsize: 1, 
              price: 1, 
              saleprice: 1 
            }
          }
        ).limit(10).toArray();
        break;
      
      case 'departments':
        suggestions = await productsCollection.distinct('department', { 
          department: searchRegex,
          ...baseFilter
        });
        break;
      
      case 'categories':
        suggestions = await productsCollection.distinct('category', { 
          category: searchRegex,
          ...baseFilter
        });
        break;
      
      case 'subcategories':
        suggestions = await productsCollection.distinct('subcategory', { 
          subcategory: searchRegex,
          ...baseFilter
        });
        break;

      default: // 'all'
        const [products, departments, categories, subcategories] = await Promise.all([
          productsCollection.find({ 
            name: searchRegex,
            ...baseFilter
          }, { 
            projection: {
              name: 1, 
              sku: 1, 
              brand: 1, 
              productimg: 1, 
              size: 1, 
              packsize: 1, 
              price: 1, 
              saleprice: 1 
            }
          }).limit(5).toArray(),
          productsCollection.distinct('department', { 
            department: searchRegex,
            ...baseFilter
          }),
          productsCollection.distinct('category', { 
            category: searchRegex,
            ...baseFilter
          }),
          productsCollection.distinct('subcategory', { 
            subcategory: searchRegex,
            ...baseFilter
          })
        ]);
        
        suggestions = {
          products: products.slice(0, 5),
          departments: departments.slice(0, 3),
          categories: categories.slice(0, 3),
          subcategories: subcategories.slice(0, 3)
        };
        break;
    }

    res.json({ success: true, suggestions });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get suggestions', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByDepartment,
  searchProducts,
  getSearchSuggestions
};
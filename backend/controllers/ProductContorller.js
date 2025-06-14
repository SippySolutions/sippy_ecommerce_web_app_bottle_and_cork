const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
  try {
    // Exclude products where department is 'TOBACCO' (case-insensitive, any case)
    const products = await Product.find({ department: { $not: { $regex: /^tobacco$/i } } });
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

    // Build the query dynamically based on the type and exclude tobacco
    const query = { 
      bestseller: true,
      department: { $not: { $regex: /^tobacco$/i } }  // Exclude tobacco department
    };

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

// Search products by name, SKU, department, category, subcategory
const searchProducts = async (req, res) => {
  try {
    const { q, department, category, subcategory, page = 1, limit = 20 } = req.query;
    
    if (!q && !department && !category && !subcategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query or filter parameters required' 
      });
    }    // Build search criteria
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

    // Additional filters
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

    console.log('Search criteria:', searchCriteria);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute search with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(searchCriteria)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ name: 1 }), // Sort by name ascending
      Product.countDocuments(searchCriteria)
    ]);    // Get search suggestions (departments, categories, subcategories) - exclude tobacco
    const suggestions = await Product.aggregate([
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
    ]);

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
      filters: { department, category, subcategory },
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
    const { q, type = 'all' } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }    const searchRegex = new RegExp(q, 'i');
    let suggestions = [];

    // Base filter to exclude tobacco department
    const baseFilter = { department: { $not: { $regex: /^tobacco$/i } } };

    switch (type) {
      case 'products':
        suggestions = await Product.find(
          { 
            name: searchRegex,
            ...baseFilter
          },
          { name: 1, sku: 1, brand: 1 }
        ).limit(10);
        break;
      
      case 'departments':
        suggestions = await Product.distinct('department', { 
          department: searchRegex,
          ...baseFilter
        });
        break;
      
      case 'categories':
        suggestions = await Product.distinct('category', { 
          category: searchRegex,
          ...baseFilter
        });
        break;
      
      case 'subcategories':
        suggestions = await Product.distinct('subcategory', { 
          subcategory: searchRegex,
          ...baseFilter
        });
        break;
      
      default: // 'all'
        const [products, departments, categories, subcategories] = await Promise.all([
          Product.find({ 
            name: searchRegex,
            ...baseFilter
          }, { name: 1, sku: 1 }).limit(5),
          Product.distinct('department', { 
            department: searchRegex,
            ...baseFilter
          }),
          Product.distinct('category', { 
            category: searchRegex,
            ...baseFilter
          }),
          Product.distinct('subcategory', { 
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
  searchProducts,
  getSearchSuggestions
};
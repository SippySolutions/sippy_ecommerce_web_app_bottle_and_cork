// Helper function to get models for specific database connection
const getModels = (connection) => {
  try {
    const Product = connection.model('Product');
    const Category = connection.model('Category');
    return { Product, Category };
  } catch (error) {
    console.error('Error getting models:', error);
    throw error;
  }
};

// Controller to get departments with categories and subcategories
const getDepartmentsWithCategories = async (req, res) => {
  try {
    // Use the database connection from the middleware
    const db = req.dbConnection.db;
    
    if (!db) {
      throw new Error('Database connection not available from middleware');
    }
    
    // Access the categories collection directly
    const categoriesCollection = db.collection('categories');
    
    // Get all active categories
    const allCategories = await categoriesCollection
      .find({ isActive: true })
      .sort({ level: 1, sortOrder: 1, name: 1 })
      .toArray();
    
    if (allCategories.length === 0) {
      return res.status(200).json({ 
        success: true, 
        departments: [],
        message: 'No active categories found'
      });
    }

    // Separate by levels
    const departments = allCategories.filter(cat => cat.level === 0);
    const categories = allCategories.filter(cat => cat.level === 1);
    const subcategories = allCategories.filter(cat => cat.level === 2);

    // Build hierarchical structure
    const departmentsWithHierarchy = departments.map(department => {
      // Find categories for this department
      const departmentCategories = categories
        .filter(cat => {
          if (!cat.parent) {
            return false;
          }
          return cat.parent.toString() === department._id.toString();
        })
        .map(category => {
                    
          // Find subcategories for this category
          const categorySubcategories = subcategories
            .filter(sub => {
              if (!sub.parent) {
                return false;
              }
              const hasParent = sub.parent.toString() === category._id.toString();
              if (hasParent) {
                              }
              return hasParent;
            })
            .map(sub => sub.name)
            .sort();

          return {
            category: category.name,
            subcategories: categorySubcategories
          };
        });

      
      return {
        department: department.name,
        categories: departmentCategories
      };
    });

        
    res.status(200).json({ 
      success: true, 
      departments: departmentsWithHierarchy 
    });
  } catch (error) {
    console.error('❌ Error in getDepartmentsWithCategories:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch departments',
      error: error.message 
    });
  }
};

module.exports = { getDepartmentsWithCategories };


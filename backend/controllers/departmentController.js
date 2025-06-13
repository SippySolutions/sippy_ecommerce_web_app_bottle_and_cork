const Product = require('../models/Product');

// Controller to get departments with categories and subcategories
const getDepartmentsWithCategories = async (req, res) => {
  try {
    const departments = await Product.aggregate([
      // Match only documents with valid department and exclude "MISC"
      {
        $match: {
          department: { $exists: true, $ne: null, $ne: '', $ne: 'MISC' }, // Exclude "MISC"
        },
      },
      // Group by department, category, and subcategory
      {
        $group: {
          _id: {
            department: '$department',
            category: { $ifNull: ['$category', null] }, // Allow null categories
            subcategory: { $ifNull: ['$subcategory', null] }, // Allow null subcategories
          },
        },
      },
      // Group by department and categories, nesting subcategories under each category
      {
        $group: {
          _id: {
            department: '$_id.department',
            category: '$_id.category',
          },
          subcategories: { $addToSet: '$_id.subcategory' },
        },
      },
      // Group by department, nesting categories and their subcategories
      {
        $group: {
          _id: '$_id.department',
          categories: {
            $addToSet: {
              category: '$_id.category',
              subcategories: {
                $filter: {
                  input: '$subcategories',
                  as: 'subcategory',
                  cond: { $ne: ['$$subcategory', null] }, // Exclude null subcategories
                },
              },
            },
          },
        },
      },
      // Project the final structure
      {
        $project: {
          _id: 0,
          department: '$_id',
          categories: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, departments });
  } catch (error) {
    console.error('Error fetching departments with categories and subcategories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
};

module.exports = { getDepartmentsWithCategories };

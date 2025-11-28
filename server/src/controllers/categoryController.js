const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { 
      featured, 
      parent, 
      navigation, 
      search, 
      limit = 50, 
      page = 1 
    } = req.query;

    let query = { isActive: true };

    // Filter by featured status
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Filter by parent category
    if (parent) {
      query.parent = parent === 'null' ? null : parent;
    }

    // Filter by navigation visibility
    if (navigation === 'true') {
      query.showInNavigation = true;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await require('../models/Product').countDocuments({
          category: category._id,
          isActive: true
        });
        
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: {
        categories: categoriesWithCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get category by ID or slug
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let category = await Category.findById(id).populate('parent', 'name slug');
    
    if (!category) {
      category = await Category.findOne({ slug: id }).populate('parent', 'name slug');
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get product count
    const productCount = await require('../models/Product').countDocuments({
      category: category._id,
      isActive: true
    });

    // Get subcategories
    const subcategories = await Category.find({
      parent: category._id,
      isActive: true
    }).sort({ displayOrder: 1, name: 1 });

    res.json({
      success: true,
      data: {
        category: {
          ...category.toObject(),
          productCount,
          subcategories
        }
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
};

// Get category tree (hierarchical structure)
const getCategoryTree = async (req, res) => {
  try {
    const { maxDepth } = req.query;
    
    const tree = await Category.getCategoryTree(null, maxDepth ? parseInt(maxDepth) : null);
    
    res.json({
      success: true,
      data: {
        categories: tree
      }
    });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category tree'
    });
  }
};

// Get featured categories
const getFeaturedCategories = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const categories = await Category.getFeaturedCategories(parseInt(limit));
    
    // Get product counts
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await require('../models/Product').countDocuments({
          category: category._id,
          isActive: true
        });
        
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        categories: categoriesWithCounts
      }
    });
  } catch (error) {
    console.error('Get featured categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured categories'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryTree,
  getFeaturedCategories
};
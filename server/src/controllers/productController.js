const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

/**
 * Get all products with filtering and pagination
 * @route GET /api/products
 * @access Public
 */
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Category filter
    if (category) {
      query['category.id'] = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    const sortOptions = {};
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('category.id', 'name slug');

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching products'
      }
    });
  }
};

/**
 * Get single product by ID or slug
 * @route GET /api/products/:identifier
 * @access Public
 */
const getProduct = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let product;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier).populate('category.id', 'name slug path');
    } else {
      product = await Product.findOne({ slug: identifier, isActive: true })
        .populate('category.id', 'name slug path');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching product'
      }
    });
  }
};

/**
 * Create new product
 * @route POST /api/products
 * @access Private (Admin only)
 */
const createProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const productData = req.body;

    // Verify category exists
    const category = await Category.findById(productData.category.id);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Category not found'
        }
      });
    }

    // Set category reference data
    productData.category = {
      id: category._id,
      name: category.name,
      slug: category.slug
    };

    // Create product
    const product = new Product(productData);
    await product.save();

    // Update category product count
    await category.updateProductCount();

    res.status(201).json({
      success: true,
      data: {
        product
      },
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Product with this slug already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while creating product'
      }
    });
  }
};

/**
 * Update product
 * @route PUT /api/products/:id
 * @access Private (Admin only)
 */
const updateProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found'
        }
      });
    }

    // If category is being updated, verify it exists
    if (updateData.category?.id) {
      const category = await Category.findById(updateData.category.id);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category not found'
          }
        });
      }

      updateData.category = {
        id: category._id,
        name: category.name,
        slug: category.slug
      };
    }

    // Update product
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        product[key] = updateData[key];
      }
    });

    await product.save();

    res.json({
      success: true,
      data: {
        product
      },
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Product with this slug already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while updating product'
      }
    });
  }
};

/**
 * Delete product
 * @route DELETE /api/products/:id
 * @access Private (Admin only)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found'
        }
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    // Update category product count
    const category = await Category.findById(product.category.id);
    if (category) {
      await category.updateProductCount();
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while deleting product'
      }
    });
  }
};

/**
 * Get products by category
 * @route GET /api/products/category/:categoryId
 * @access Public
 */
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found'
        }
      });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get products
    const products = await Product.findByCategory(categoryId, {
      sort: sortOptions,
      skip,
      limit: limitNum
    });

    // Get total count
    const total = await Product.countDocuments({
      'category.id': categoryId,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        category: {
          id: category._id,
          name: category.name,
          slug: category.slug
        },
        products,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching products by category'
      }
    });
  }
};

/**
 * Get featured products
 * @route GET /api/products/featured
 * @access Public
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const products = await Product.find({
      featured: true,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('category.id', 'name slug');

    res.json({
      success: true,
      data: {
        products
      }
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching featured products'
      }
    });
  }
};

/**
 * Search products
 * @route GET /api/products/search
 * @access Public
 */
const searchProducts = async (req, res) => {
  try {
    const {
      q: searchTerm,
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Search term is required'
        }
      });
    }

    // Build search query
    const query = {
      $text: { $search: searchTerm },
      isActive: true
    };

    // Add filters
    if (category) {
      query['category.id'] = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    let sortOptions = { score: { $meta: 'textScore' } };
    
    if (sortBy !== 'relevance') {
      sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute search
    const products = await Product.find(query, { score: { $meta: 'textScore' } })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('category.id', 'name slug');

    // Get total count
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        searchTerm,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while searching products'
      }
    });
  }
};

/**
 * Get product filters/facets
 * @route GET /api/products/filters
 * @access Public
 */
const getProductFilters = async (req, res) => {
  try {
    const { category, search } = req.query;

    // Build base query
    let baseQuery = { isActive: true };
    
    if (category) {
      baseQuery['category.id'] = category;
    }
    
    if (search) {
      baseQuery.$text = { $search: search };
    }

    // Get price range
    const priceRange = await Product.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    // Get categories with product counts
    const categories = await Product.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$category.id',
          name: { $first: '$category.name' },
          slug: { $first: '$category.slug' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Get popular tags
    const tags = await Product.aggregate([
      { $match: baseQuery },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          tag: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
        categories,
        tags
      }
    });

  } catch (error) {
    console.error('Get product filters error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching product filters'
      }
    });
  }
};

/**
 * Get search suggestions/autocomplete
 * @route GET /api/products/suggestions
 * @access Public
 */
const getSearchSuggestions = async (req, res) => {
  try {
    const { q: searchTerm, limit = 10 } = req.query;

    if (!searchTerm || searchTerm.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    // Get product name suggestions
    const productSuggestions = await Product.find({
      name: { $regex: searchTerm, $options: 'i' },
      isActive: true
    })
    .select('name slug')
    .limit(parseInt(limit) / 2)
    .sort({ featured: -1, createdAt: -1 });

    // Get tag suggestions
    const tagSuggestions = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $match: { tags: { $regex: searchTerm, $options: 'i' } } },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) / 2 },
      {
        $project: {
          tag: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    const suggestions = [
      ...productSuggestions.map(p => ({
        type: 'product',
        text: p.name,
        slug: p.slug
      })),
      ...tagSuggestions.map(t => ({
        type: 'tag',
        text: t.tag,
        count: t.count
      }))
    ];

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching search suggestions'
      }
    });
  }
};

/**
 * Update product inventory
 * @route PUT /api/products/:id/inventory
 * @access Private (Admin only)
 */
const updateInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;
    const { count, trackInventory, allowBackorder, lowStockThreshold } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found'
        }
      });
    }

    // Update inventory fields
    if (count !== undefined) product.inventory.count = count;
    if (trackInventory !== undefined) product.inventory.trackInventory = trackInventory;
    if (allowBackorder !== undefined) product.inventory.allowBackorder = allowBackorder;
    if (lowStockThreshold !== undefined) product.inventory.lowStockThreshold = lowStockThreshold;

    await product.save();

    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          inventory: product.inventory,
          stockStatus: product.stockStatus,
          isAvailable: product.isAvailable
        }
      },
      message: 'Inventory updated successfully'
    });

  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while updating inventory'
      }
    });
  }
};

/**
 * Adjust inventory (add/subtract stock)
 * @route POST /api/products/:id/inventory/adjust
 * @access Private (Admin only)
 */
const adjustInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;
    const { adjustment, reason } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found'
        }
      });
    }

    if (!product.inventory.trackInventory) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Inventory tracking is not enabled for this product'
        }
      });
    }

    const previousCount = product.inventory.count;
    const newCount = Math.max(0, previousCount + adjustment);
    
    product.inventory.count = newCount;
    await product.save();

    // Log the adjustment (in a real app, you'd save this to an audit log)
    console.log(`Inventory adjustment for product ${product.name} (${product._id}): ${previousCount} -> ${newCount} (${adjustment > 0 ? '+' : ''}${adjustment}). Reason: ${reason || 'No reason provided'}`);

    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          inventory: product.inventory,
          stockStatus: product.stockStatus,
          isAvailable: product.isAvailable
        },
        adjustment: {
          previousCount,
          newCount,
          adjustment,
          reason
        }
      },
      message: 'Inventory adjusted successfully'
    });

  } catch (error) {
    console.error('Adjust inventory error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while adjusting inventory'
      }
    });
  }
};

/**
 * Get low stock products
 * @route GET /api/products/inventory/low-stock
 * @access Private (Admin only)
 */
const getLowStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Find products with low stock
    const products = await Product.find({
      isActive: true,
      'inventory.trackInventory': true,
      $expr: {
        $lte: ['$inventory.count', '$inventory.lowStockThreshold']
      }
    })
    .select('name slug price inventory category')
    .populate('category.id', 'name slug')
    .sort({ 'inventory.count': 1 })
    .skip(skip)
    .limit(limitNum);

    // Get total count
    const total = await Product.countDocuments({
      isActive: true,
      'inventory.trackInventory': true,
      $expr: {
        $lte: ['$inventory.count', '$inventory.lowStockThreshold']
      }
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching low stock products'
      }
    });
  }
};

/**
 * Get out of stock products
 * @route GET /api/products/inventory/out-of-stock
 * @access Private (Admin only)
 */
const getOutOfStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Find products that are out of stock
    const products = await Product.find({
      isActive: true,
      'inventory.trackInventory': true,
      'inventory.count': 0,
      'inventory.allowBackorder': false
    })
    .select('name slug price inventory category')
    .populate('category.id', 'name slug')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limitNum);

    // Get total count
    const total = await Product.countDocuments({
      isActive: true,
      'inventory.trackInventory': true,
      'inventory.count': 0,
      'inventory.allowBackorder': false
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get out of stock products error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching out of stock products'
      }
    });
  }
};

/**
 * Get inventory summary/statistics
 * @route GET /api/products/inventory/summary
 * @access Private (Admin only)
 */
const getInventorySummary = async (req, res) => {
  try {
    const summary = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          trackedProducts: {
            $sum: { $cond: ['$inventory.trackInventory', 1, 0] }
          },
          totalInventory: {
            $sum: { $cond: ['$inventory.trackInventory', '$inventory.count', 0] }
          },
          lowStockProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    '$inventory.trackInventory',
                    { $lte: ['$inventory.count', '$inventory.lowStockThreshold'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          outOfStockProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    '$inventory.trackInventory',
                    { $eq: ['$inventory.count', 0] },
                    { $eq: ['$inventory.allowBackorder', false] }
                  ]
                },
                1,
                0
              ]
            }
          },
          backorderProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    '$inventory.trackInventory',
                    { $eq: ['$inventory.count', 0] },
                    { $eq: ['$inventory.allowBackorder', true] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          trackedProducts: 1,
          untrackedProducts: { $subtract: ['$totalProducts', '$trackedProducts'] },
          totalInventory: 1,
          lowStockProducts: 1,
          outOfStockProducts: 1,
          backorderProducts: 1,
          inStockProducts: {
            $subtract: [
              '$trackedProducts',
              { $add: ['$lowStockProducts', '$outOfStockProducts', '$backorderProducts'] }
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: summary[0] || {
          totalProducts: 0,
          trackedProducts: 0,
          untrackedProducts: 0,
          totalInventory: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          backorderProducts: 0,
          inStockProducts: 0
        }
      }
    });

  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching inventory summary'
      }
    });
  }
};

/**
 * Import products from CSV file
 * @route POST /api/admin/products/import
 * @access Private (Admin only)
 */
const importProductsFromCSV = async (req, res) => {
  try {
    console.log('CSV import started');
    console.log('File info:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No CSV file uploaded'
        }
      });
    }

    const results = [];
    const errors = [];
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    // Read and parse CSV file
    console.log('Reading CSV file from:', req.file.path);
    const csvData = await new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          console.log('CSV row:', row);
          data.push(row);
        })
        .on('end', () => {
          console.log(`CSV parsing complete. Found ${data.length} rows`);
          resolve(data);
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          reject(error);
        });
    });

    // Process each row
    for (const row of csvData) {
      processedCount++;
      
      try {
        // Validate required fields
        if (!row.name || !row.price || !row.categoryId) {
          errors.push({
            row: processedCount,
            error: 'Missing required fields: name, price, or categoryId',
            data: row
          });
          errorCount++;
          continue;
        }

        // Verify category exists
        const category = await Category.findById(row.categoryId);
        if (!category) {
          errors.push({
            row: processedCount,
            error: `Category with ID ${row.categoryId} not found`,
            data: row
          });
          errorCount++;
          continue;
        }

        // Parse and validate data
        const productData = {
          name: row.name.trim(),
          description: row.description || '',
          price: parseFloat(row.price),
          category: {
            id: category._id,
            name: category.name,
            slug: category.slug
          },
          images: row.images ? row.images.split(',').map((img, index) => ({
            url: img.trim(),
            alt: `${row.name.trim()} - Image ${index + 1}`,
            isPrimary: index === 0
          })) : [],
          tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
          featured: row.featured === 'true' || row.featured === '1',
          isActive: row.isActive !== 'false' && row.isActive !== '0',
          inventory: {
            trackInventory: row.trackInventory === 'true' || row.trackInventory === '1',
            count: parseInt(row.inventoryCount) || 0,
            allowBackorder: row.allowBackorder === 'true' || row.allowBackorder === '1',
            lowStockThreshold: parseInt(row.lowStockThreshold) || 10
          }
        };

        // Add optional fields if provided
        if (row.sku) productData.sku = row.sku.trim();
        if (row.weight) productData.weight = parseFloat(row.weight);
        if (row.dimensions) {
          const dims = row.dimensions.split('x').map(d => parseFloat(d.trim()));
          if (dims.length === 3) {
            productData.dimensions = {
              length: dims[0],
              width: dims[1],
              height: dims[2]
            };
          }
        }

        // Validate price
        if (isNaN(productData.price) || productData.price < 0) {
          errors.push({
            row: processedCount,
            error: 'Invalid price value',
            data: row
          });
          errorCount++;
          continue;
        }

        // Create product
        const product = new Product(productData);
        await product.save();

        // Update category product count
        await category.updateProductCount();

        results.push({
          row: processedCount,
          success: true,
          product: {
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category.name
          }
        });
        successCount++;

      } catch (error) {
        console.error(`Error processing row ${processedCount}:`, error);
        errors.push({
          row: processedCount,
          error: error.message || 'Unknown error occurred',
          data: row
        });
        errorCount++;
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        summary: {
          totalRows: processedCount,
          successCount,
          errorCount,
          successRate: processedCount > 0 ? ((successCount / processedCount) * 100).toFixed(2) : 0
        },
        results: results.slice(0, 10), // Show first 10 successful imports
        errors: errors.slice(0, 10) // Show first 10 errors
      },
      message: `Import completed. ${successCount} products imported successfully, ${errorCount} errors occurred.`
    });

  } catch (error) {
    console.error('CSV import error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Server error during CSV import'
      }
    });
  }
};

/**
 * Download CSV template for product import
 * @route GET /api/admin/products/import/template
 * @access Private (Admin only)
 */
const downloadCSVTemplate = async (req, res) => {
  try {
    // Get available categories to include in template
    const categories = await Category.find({ isActive: true })
      .select('_id name slug')
      .sort({ name: 1 });

    const csvHeaders = [
      'name',
      'description',
      'price',
      'categoryId',
      'sku',
      'images',
      'tags',
      'featured',
      'isActive',
      'trackInventory',
      'inventoryCount',
      'allowBackorder',
      'lowStockThreshold',
      'weight',
      'dimensions'
    ];

    // Create sample data with actual category ID
    const firstCategoryId = categories.length > 0 ? categories[0]._id.toString() : 'CATEGORY_ID_HERE';
    
    const sampleData = [
      'Sample Product',
      'This is a sample product description',
      '29.99',
      firstCategoryId,
      'SKU001',
      'https://example.com/image1.jpg,https://example.com/image2.jpg',
      'tag1,tag2,tag3',
      'false',
      'true',
      'true',
      '100',
      'false',
      '10',
      '1.5',
      '10x5x3'
    ];

    // Create CSV content with headers and sample data
    let csvContent = csvHeaders.join(',') + '\n' + sampleData.join(',') + '\n\n';
    
    // Add available categories as comments
    csvContent += '# Available Categories:\n';
    categories.forEach(category => {
      csvContent += `# ${category._id} - ${category.name} (${category.slug})\n`;
    });
    
    csvContent += '\n# CSV Format Notes:\n';
    csvContent += '# - name: Product name (required)\n';
    csvContent += '# - description: Product description\n';
    csvContent += '# - price: Product price in decimal format (required)\n';
    csvContent += '# - categoryId: Category ID from the list above (required)\n';
    csvContent += '# - sku: Stock Keeping Unit (optional)\n';
    csvContent += '# - images: Comma-separated image URLs\n';
    csvContent += '# - tags: Comma-separated tags\n';
    csvContent += '# - featured: true/false or 1/0\n';
    csvContent += '# - isActive: true/false or 1/0 (default: true)\n';
    csvContent += '# - trackInventory: true/false or 1/0\n';
    csvContent += '# - inventoryCount: Number of items in stock\n';
    csvContent += '# - allowBackorder: true/false or 1/0\n';
    csvContent += '# - lowStockThreshold: Number for low stock alert\n';
    csvContent += '# - weight: Product weight in kg\n';
    csvContent += '# - dimensions: Format as LengthxWidthxHeight (e.g., 10x5x3)\n';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="product-import-template.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while generating template'
      }
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  getProductFilters,
  getSearchSuggestions,
  updateInventory,
  adjustInventory,
  getLowStockProducts,
  getOutOfStockProducts,
  getInventorySummary,
  importProductsFromCSV,
  downloadCSVTemplate
};
const express = require('express');
const router = express.Router();

// Import controllers
const {
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
  getInventorySummary
} = require('../controllers/productController');

// Import middleware
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateProduct,
  validateProductUpdate,
  validateObjectId,
  validateInventoryUpdate,
  validateInventoryAdjustment
} = require('../middleware/validation');

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', getFeaturedProducts);

/**
 * @route   GET /api/products/search
 * @desc    Search products
 * @access  Public
 */
router.get('/search', searchProducts);

/**
 * @route   GET /api/products/filters
 * @desc    Get product filters/facets
 * @access  Public
 */
router.get('/filters', getProductFilters);

/**
 * @route   GET /api/products/suggestions
 * @desc    Get search suggestions/autocomplete
 * @access  Public
 */
router.get('/suggestions', getSearchSuggestions);

/**
 * @route   GET /api/products/inventory/summary
 * @desc    Get inventory summary/statistics
 * @access  Private (Admin only)
 */
router.get('/inventory/summary',
  authenticate,
  authorize('admin'),
  getInventorySummary
);

/**
 * @route   GET /api/products/inventory/low-stock
 * @desc    Get low stock products
 * @access  Private (Admin only)
 */
router.get('/inventory/low-stock',
  authenticate,
  authorize('admin'),
  getLowStockProducts
);

/**
 * @route   GET /api/products/inventory/out-of-stock
 * @desc    Get out of stock products
 * @access  Private (Admin only)
 */
router.get('/inventory/out-of-stock',
  authenticate,
  authorize('admin'),
  getOutOfStockProducts
);

/**
 * @route   GET /api/products/category/:categoryId
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:categoryId',
  validateObjectId('categoryId'),
  getProductsByCategory
);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin only)
 */
router.post('/',
  authenticate,
  authorize('admin'),
  validateProduct,
  createProduct
);

/**
 * @route   GET /api/products/:identifier
 * @desc    Get single product by ID or slug
 * @access  Public
 */
router.get('/:identifier', getProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin only)
 */
router.put('/:id',
  authenticate,
  authorize('admin'),
  validateObjectId('id'),
  validateProductUpdate,
  updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authenticate,
  authorize('admin'),
  validateObjectId('id'),
  deleteProduct
);

/**
 * @route   PUT /api/products/:id/inventory
 * @desc    Update product inventory
 * @access  Private (Admin only)
 */
router.put('/:id/inventory',
  authenticate,
  authorize('admin'),
  validateObjectId('id'),
  validateInventoryUpdate,
  updateInventory
);

/**
 * @route   POST /api/products/:id/inventory/adjust
 * @desc    Adjust inventory (add/subtract stock)
 * @access  Private (Admin only)
 */
router.post('/:id/inventory/adjust',
  authenticate,
  authorize('admin'),
  validateObjectId('id'),
  validateInventoryAdjustment,
  adjustInventory
);

module.exports = router;
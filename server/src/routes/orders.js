const express = require('express');
const router = express.Router();

// Import controllers
const {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  getCheckoutSummary,
  updateOrderStatus,
  getOrderTracking,
  getAllOrders,
  getOrderStats,
  getOrderAdmin,
  updateOrderAdmin,
  getOrdersRequiringAttention
} = require('../controllers/orderController');

// Import middleware
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateOrder,
  validateOrderCancel,
  validateCheckoutSummary,
  validateOrderStatusUpdate,
  validateObjectId
} = require('../middleware/validation');

/**
 * @route   GET /api/orders/tracking/:id
 * @desc    Get order tracking information (public with order number or private with order ID)
 * @access  Public/Private
 */
router.get('/tracking/:id',
  optionalAuth,
  getOrderTracking
);

// Admin routes (require admin role)
/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/all',
  authenticate,
  authorize('admin'),
  getAllOrders
);

/**
 * @route   GET /api/orders/admin/stats
 * @desc    Get order statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/stats',
  authenticate,
  authorize('admin'),
  getOrderStats
);

/**
 * @route   GET /api/orders/admin/attention
 * @desc    Get orders requiring attention (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/attention',
  authenticate,
  authorize('admin'),
  getOrdersRequiringAttention
);

/**
 * @route   GET /api/orders/admin/:id
 * @desc    Get single order details (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/:id',
  authenticate,
  authorize('admin'),
  validateObjectId('id'),
  getOrderAdmin
);

/**
 * @route   PUT /api/orders/admin/:id
 * @desc    Update order details (Admin only)
 * @access  Private (Admin)
 */
router.put('/admin/:id',
  authenticate,
  authorize('admin'),
  validateObjectId('id'),
  updateOrderAdmin
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id/status',
  authenticate,
  authorize('admin'),
  validateObjectId('id'),
  validateOrderStatusUpdate,
  updateOrderStatus
);

// All other order routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', getOrders);

/**
 * @route   POST /api/orders/checkout/summary
 * @desc    Get checkout summary (validate cart and calculate totals)
 * @access  Private
 */
router.post('/checkout/summary',
  validateCheckoutSummary,
  getCheckoutSummary
);

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 */
router.post('/',
  validateOrder,
  createOrder
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
router.get('/:id',
  validateObjectId('id'),
  getOrder
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put('/:id/cancel',
  validateObjectId('id'),
  validateOrderCancel,
  cancelOrder
);

module.exports = router;
const express = require('express');
const router = express.Router();

// Import controllers
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon
} = require('../controllers/cartController');

// Import middleware
const { authenticate } = require('../middleware/auth');
const {
  validateCartItem,
  validateCartItemUpdate,
  validateCoupon
} = require('../middleware/validation');

// All cart routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/items',
  validateCartItem,
  addToCart
);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/items/:itemId',
  validateCartItemUpdate,
  updateCartItem
);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/items/:itemId', removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/', clearCart);

/**
 * @route   POST /api/cart/coupon
 * @desc    Apply coupon to cart
 * @access  Private
 */
router.post('/coupon',
  validateCoupon,
  applyCoupon
);

/**
 * @route   DELETE /api/cart/coupon
 * @desc    Remove coupon from cart
 * @access  Private
 */
router.delete('/coupon', removeCoupon);

module.exports = router;
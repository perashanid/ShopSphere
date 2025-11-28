const express = require('express');
const router = express.Router();

// Import controllers
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus
} = require('../controllers/wishlistController');

// Import middleware
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

// All wishlist routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/', getWishlist);

/**
 * @route   POST /api/wishlist
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post('/',
  [
    body('productId')
      .isMongoId()
      .withMessage('Product ID is required and must be valid')
  ],
  addToWishlist
);

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/:productId', removeFromWishlist);

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete('/', clearWishlist);

/**
 * @route   GET /api/wishlist/check/:productId
 * @desc    Check if product is in wishlist
 * @access  Private
 */
router.get('/check/:productId', checkWishlistStatus);

module.exports = router;
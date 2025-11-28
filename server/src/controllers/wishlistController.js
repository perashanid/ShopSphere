const { validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Get user's wishlist
 * @route GET /api/wishlist
 * @access Private
 */
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'wishlist.productId',
      select: 'name slug price images category isActive inventory',
      match: { isActive: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Filter out products that are no longer active
    const activeWishlistItems = user.wishlist.filter(item => item.productId);

    // If some products were removed, update the user's wishlist
    if (activeWishlistItems.length !== user.wishlist.length) {
      user.wishlist = activeWishlistItems;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        wishlist: activeWishlistItems.map(item => ({
          id: item._id,
          product: {
            id: item.productId._id,
            name: item.productId.name,
            slug: item.productId.slug,
            price: item.productId.price,
            images: item.productId.images || [],
            primaryImage: item.productId.images && item.productId.images.length > 0 
              ? item.productId.images.find(img => img.isPrimary) || item.productId.images[0] 
              : null,
            category: item.productId.category,
            isAvailable: item.productId.isAvailable,
            stockStatus: item.productId.stockStatus
          },
          addedAt: item.addedAt
        })),
        count: activeWishlistItems.length
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching wishlist'
      }
    });
  }
};

/**
 * Add product to wishlist
 * @route POST /api/wishlist
 * @access Private
 */
const addToWishlist = async (req, res) => {
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

    const { productId } = req.body;
    const userId = req.user._id;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found or unavailable'
        }
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Check if product is already in wishlist
    const existingItem = user.wishlist.find(item => 
      item.productId.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Product is already in wishlist'
        }
      });
    }

    // Add to wishlist
    user.wishlist.push({
      productId,
      addedAt: new Date()
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        wishlistCount: user.wishlist.length
      },
      message: 'Product added to wishlist successfully'
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while adding to wishlist'
      }
    });
  }
};

/**
 * Remove product from wishlist
 * @route DELETE /api/wishlist/:productId
 * @access Private
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Find and remove the item
    const itemIndex = user.wishlist.findIndex(item => 
      item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found in wishlist'
        }
      });
    }

    user.wishlist.splice(itemIndex, 1);
    await user.save();

    res.json({
      success: true,
      data: {
        wishlistCount: user.wishlist.length
      },
      message: 'Product removed from wishlist successfully'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while removing from wishlist'
      }
    });
  }
};

/**
 * Clear entire wishlist
 * @route DELETE /api/wishlist
 * @access Private
 */
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user and clear wishlist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    user.wishlist = [];
    await user.save();

    res.json({
      success: true,
      data: {
        wishlistCount: 0
      },
      message: 'Wishlist cleared successfully'
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while clearing wishlist'
      }
    });
  }
};

/**
 * Check if product is in wishlist
 * @route GET /api/wishlist/check/:productId
 * @access Private
 */
const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    const isInWishlist = user.wishlist.some(item => 
      item.productId.toString() === productId
    );

    res.json({
      success: true,
      data: {
        isInWishlist,
        wishlistCount: user.wishlist.length
      }
    });

  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while checking wishlist status'
      }
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus
};
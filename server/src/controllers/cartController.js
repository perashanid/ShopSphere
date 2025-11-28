const { validationResult } = require('express-validator');
const Product = require('../models/Product');

// In-memory cart storage for demo (in production, use Redis or database)
const carts = new Map();

/**
 * Get user's cart
 * @route GET /api/cart
 * @access Private
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const cart = carts.get(userId) || { items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 } };

    // Populate product details for cart items
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await Product.findById(item.productId).select('name slug price images inventory isActive');
          
          if (!product || !product.isActive) {
            return null; // Product no longer available
          }

          return {
            id: item.id,
            product: {
              id: product._id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              images: product.images || [],
              primaryImage: product.primaryImage || null,
              isAvailable: product.isAvailable,
              stockStatus: product.stockStatus
            },
            variant: item.variant,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          };
        } catch (error) {
          console.error(`Error populating product ${item.productId}:`, error);
          return null; // Skip invalid products
        }
      })
    );

    // Filter out unavailable products
    const validItems = populatedItems.filter(item => item !== null);

    // Recalculate totals
    const subtotal = validItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08; // 8% tax rate (configurable)
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    const updatedCart = {
      items: validItems,
      totals: {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping: Math.round(shipping * 100) / 100,
        total: Math.round(total * 100) / 100
      },
      itemCount: validItems.reduce((sum, item) => sum + item.quantity, 0)
    };

    // Update stored cart if items were removed
    if (validItems.length !== cart.items.length) {
      carts.set(userId, updatedCart);
    }

    res.json({
      success: true,
      data: {
        cart: updatedCart
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching cart'
      }
    });
  }
};

/**
 * Add item to cart
 * @route POST /api/cart/items
 * @access Private
 */
const addToCart = async (req, res) => {
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

    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user._id.toString();

    // Get product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found or unavailable'
        }
      });
    }

    // Check if product is in stock
    if (!product.isInStock(quantity)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Insufficient inventory',
          availableQuantity: product.inventory.count
        }
      });
    }

    // Get variant if specified
    let variant = null;
    let unitPrice = product.price;
    
    if (variantId) {
      variant = product.variants.id(variantId);
      if (!variant || !variant.isActive) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Product variant not found or unavailable'
          }
        });
      }
      unitPrice = variant.price || product.price;
    }

    // Get or create cart
    let cart = carts.get(userId) || { items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 } };

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId === productId && 
      ((!item.variantId && !variantId) || (item.variantId === variantId))
    );

    const itemId = `${productId}_${variantId || 'default'}`;

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      // Check stock for new quantity
      if (!product.isInStock(newQuantity)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Insufficient inventory for requested quantity',
            availableQuantity: product.inventory.count,
            currentCartQuantity: existingItem.quantity
          }
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.totalPrice = Math.round(unitPrice * newQuantity * 100) / 100;
    } else {
      // Add new item
      const newItem = {
        id: itemId,
        productId,
        variantId,
        variant: variant ? {
          id: variant._id,
          name: variant.name,
          sku: variant.sku,
          attributes: variant.attributes
        } : null,
        quantity,
        unitPrice: Math.round(unitPrice * 100) / 100,
        totalPrice: Math.round(unitPrice * quantity * 100) / 100
      };

      cart.items.push(newItem);
    }

    // Recalculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    cart.totals = {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100
    };

    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // Save cart
    carts.set(userId, cart);

    res.status(201).json({
      success: true,
      data: {
        cart
      },
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while adding item to cart'
      }
    });
  }
};

/**
 * Update cart item quantity
 * @route PUT /api/cart/items/:itemId
 * @access Private
 */
const updateCartItem = async (req, res) => {
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

    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id.toString();

    const cart = carts.get(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart not found'
        }
      });
    }

    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart item not found'
        }
      });
    }

    const item = cart.items[itemIndex];

    // Get product to check stock
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product no longer available'
        }
      });
    }

    // Check stock
    if (!product.isInStock(quantity)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Insufficient inventory',
          availableQuantity: product.inventory.count
        }
      });
    }

    // Update item
    item.quantity = quantity;
    item.totalPrice = Math.round(item.unitPrice * quantity * 100) / 100;

    // Recalculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    cart.totals = {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100
    };

    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // Save cart
    carts.set(userId, cart);

    res.json({
      success: true,
      data: {
        cart
      },
      message: 'Cart item updated successfully'
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while updating cart item'
      }
    });
  }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/items/:itemId
 * @access Private
 */
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id.toString();

    const cart = carts.get(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart not found'
        }
      });
    }

    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart item not found'
        }
      });
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    cart.totals = {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100
    };

    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // Save cart
    carts.set(userId, cart);

    res.json({
      success: true,
      data: {
        cart
      },
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while removing item from cart'
      }
    });
  }
};

/**
 * Clear entire cart
 * @route DELETE /api/cart
 * @access Private
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Clear cart
    carts.delete(userId);

    res.json({
      success: true,
      data: {
        cart: {
          items: [],
          totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 },
          itemCount: 0
        }
      },
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while clearing cart'
      }
    });
  }
};

/**
 * Apply coupon to cart
 * @route POST /api/cart/coupon
 * @access Private
 */
const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user._id.toString();

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Coupon code is required'
        }
      });
    }

    const cart = carts.get(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cart is empty'
        }
      });
    }

    // Simple coupon validation (in production, check against database)
    const validCoupons = {
      'SAVE10': { type: 'percentage', value: 10, minAmount: 25 },
      'SAVE20': { type: 'percentage', value: 20, minAmount: 50 },
      'FREESHIP': { type: 'free_shipping', value: 0, minAmount: 0 }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    if (!coupon) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid coupon code'
        }
      });
    }

    if (cart.totals.subtotal < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Minimum order amount of $${coupon.minAmount} required for this coupon`
        }
      });
    }

    // Apply coupon
    let discount = 0;
    let shipping = cart.totals.subtotal > 50 ? 0 : 9.99;

    if (coupon.type === 'percentage') {
      discount = Math.round(cart.totals.subtotal * (coupon.value / 100) * 100) / 100;
    } else if (coupon.type === 'free_shipping') {
      shipping = 0;
    }

    const subtotal = cart.totals.subtotal;
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
    const total = subtotal - discount + tax + shipping;

    cart.totals = {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100
    };

    cart.coupon = {
      code: couponCode.toUpperCase(),
      type: coupon.type,
      value: coupon.value,
      discount: discount
    };

    // Save cart
    carts.set(userId, cart);

    res.json({
      success: true,
      data: {
        cart
      },
      message: 'Coupon applied successfully'
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while applying coupon'
      }
    });
  }
};

/**
 * Remove coupon from cart
 * @route DELETE /api/cart/coupon
 * @access Private
 */
const removeCoupon = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const cart = carts.get(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Cart not found'
        }
      });
    }

    // Remove coupon and recalculate
    delete cart.coupon;

    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    cart.totals = {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100
    };

    // Save cart
    carts.set(userId, cart);

    res.json({
      success: true,
      data: {
        cart
      },
      message: 'Coupon removed successfully'
    });

  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while removing coupon'
      }
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon
};
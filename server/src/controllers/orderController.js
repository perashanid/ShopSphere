const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Import cart storage (same as cart controller)
const carts = new Map();

/**
 * Get user's orders
 * @route GET /api/orders
 * @access Private
 */
const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { 'user.id': req.user._id };
    
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get orders
    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching orders'
      }
    });
  }
};

/**
 * Get single order
 * @route GET /api/orders/:id
 * @access Private
 */
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      'user.id': req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching order'
      }
    });
  }
};

/**
 * Create order from cart
 * @route POST /api/orders
 * @access Private
 */
const createOrder = async (req, res) => {
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

    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
      customerNotes
    } = req.body;

    const userId = req.user._id.toString();

    // Get cart
    const cart = carts.get(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cart is empty'
        }
      });
    }

    // Validate and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Product ${cartItem.productId} is no longer available`
          }
        });
      }

      // Check inventory
      if (!product.isInStock(cartItem.quantity)) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Insufficient inventory for ${product.name}`,
            availableQuantity: product.inventory.count
          }
        });
      }

      // Get variant if applicable
      let variant = null;
      if (cartItem.variantId) {
        variant = product.variants.id(cartItem.variantId);
        if (!variant || !variant.isActive) {
          return res.status(400).json({
            success: false,
            error: {
              message: `Product variant is no longer available`
            }
          });
        }
      }

      const orderItem = {
        product: {
          id: product._id,
          name: product.name,
          slug: product.slug,
          image: {
            url: product.primaryImage?.url || '',
            alt: product.primaryImage?.alt || product.name
          }
        },
        variant: variant ? {
          id: variant._id,
          name: variant.name,
          sku: variant.sku,
          attributes: variant.attributes
        } : null,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        totalPrice: cartItem.totalPrice
      };

      orderItems.push(orderItem);
      subtotal += cartItem.totalPrice;
    }

    // Calculate totals
    const taxRate = 0.08; // 8% tax rate
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    
    // Shipping cost calculation
    let shippingCost = 0;
    const shippingMethods = {
      'standard': { cost: 9.99, name: 'Standard Shipping (5-7 days)' },
      'express': { cost: 19.99, name: 'Express Shipping (2-3 days)' },
      'overnight': { cost: 39.99, name: 'Overnight Shipping (1 day)' }
    };

    if (shippingMethods[shippingMethod]) {
      shippingCost = shippingMethods[shippingMethod].cost;
    }

    // Free shipping over $50
    if (subtotal > 50 && shippingMethod === 'standard') {
      shippingCost = 0;
    }

    // Apply discount if coupon was used
    let discount = 0;
    let couponCode = null;
    if (cart.coupon) {
      discount = cart.coupon.discount || 0;
      couponCode = cart.coupon.code;
    }

    const total = subtotal - discount + tax + shippingCost;

    // Create order
    const orderData = {
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.fullName
      },
      items: orderItems,
      shippingAddress,
      billingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: 'pending'
      },
      shippingInfo: {
        method: shippingMethods[shippingMethod]?.name || 'Standard Shipping',
        cost: shippingCost
      },
      totals: {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        taxRate,
        shipping: Math.round(shippingCost * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100
      },
      notes: {
        customer: customerNotes
      },
      couponCode,
      isGuestOrder: false
    };

    const order = new Order(orderData);
    await order.save();

    // Reserve inventory for all items
    try {
      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.productId);
        await product.reserveInventory(cartItem.quantity);
      }
    } catch (inventoryError) {
      // If inventory reservation fails, delete the order
      await Order.findByIdAndDelete(order._id);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Failed to reserve inventory. Please try again.',
          details: inventoryError.message
        }
      });
    }

    // Clear cart after successful order creation
    carts.delete(userId);

    res.status(201).json({
      success: true,
      data: {
        order
      },
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while creating order'
      }
    });
  }
};

/**
 * Cancel order
 * @route PUT /api/orders/:id/cancel
 * @access Private
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: id,
      'user.id': req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found'
        }
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Order cannot be cancelled at this stage'
        }
      });
    }

    // Cancel order
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'Cancelled by customer';

    await order.save();

    // Release reserved inventory
    try {
      for (const item of order.items) {
        const product = await Product.findById(item.product.id);
        if (product) {
          await product.releaseInventory(item.quantity);
        }
      }
    } catch (inventoryError) {
      console.error('Error releasing inventory:', inventoryError);
      // Continue with cancellation even if inventory release fails
    }

    res.json({
      success: true,
      data: {
        order
      },
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while cancelling order'
      }
    });
  }
};

/**
 * Get checkout summary (validate cart and calculate totals)
 * @route POST /api/orders/checkout/summary
 * @access Private
 */
const getCheckoutSummary = async (req, res) => {
  try {
    const { shippingMethod = 'standard', couponCode } = req.body;
    const userId = req.user._id.toString();

    // Get cart
    const cart = carts.get(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cart is empty'
        }
      });
    }

    // Validate cart items and calculate subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Product ${cartItem.productId} is no longer available`
          }
        });
      }

      if (!product.isInStock(cartItem.quantity)) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Insufficient inventory for ${product.name}`,
            availableQuantity: product.inventory.count
          }
        });
      }

      validatedItems.push({
        ...cartItem,
        product: {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.primaryImage
        }
      });

      subtotal += cartItem.totalPrice;
    }

    // Calculate shipping
    const shippingMethods = {
      'standard': { cost: 9.99, name: 'Standard Shipping (5-7 days)', days: '5-7' },
      'express': { cost: 19.99, name: 'Express Shipping (2-3 days)', days: '2-3' },
      'overnight': { cost: 39.99, name: 'Overnight Shipping (1 day)', days: '1' }
    };

    let shippingCost = shippingMethods[shippingMethod]?.cost || 9.99;
    
    // Free shipping over $50 for standard shipping
    if (subtotal > 50 && shippingMethod === 'standard') {
      shippingCost = 0;
    }

    // Apply coupon if provided
    let discount = 0;
    let couponError = null;
    
    if (couponCode) {
      const validCoupons = {
        'SAVE10': { type: 'percentage', value: 10, minAmount: 25 },
        'SAVE20': { type: 'percentage', value: 20, minAmount: 50 },
        'FREESHIP': { type: 'free_shipping', value: 0, minAmount: 0 }
      };

      const coupon = validCoupons[couponCode.toUpperCase()];
      if (!coupon) {
        couponError = 'Invalid coupon code';
      } else if (subtotal < coupon.minAmount) {
        couponError = `Minimum order amount of $${coupon.minAmount} required for this coupon`;
      } else {
        if (coupon.type === 'percentage') {
          discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100;
        } else if (coupon.type === 'free_shipping') {
          shippingCost = 0;
        }
      }
    }

    // Calculate tax and total
    const taxRate = 0.08;
    const tax = Math.round((subtotal - discount) * taxRate * 100) / 100;
    const total = subtotal - discount + tax + shippingCost;

    const summary = {
      items: validatedItems,
      itemCount: validatedItems.reduce((sum, item) => sum + item.quantity, 0),
      totals: {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        taxRate,
        shipping: Math.round(shippingCost * 100) / 100,
        total: Math.round(total * 100) / 100
      },
      shippingOptions: Object.entries(shippingMethods).map(([key, method]) => ({
        id: key,
        name: method.name,
        cost: method.cost,
        days: method.days,
        selected: key === shippingMethod
      })),
      coupon: couponCode ? {
        code: couponCode.toUpperCase(),
        discount,
        error: couponError
      } : null
    };

    res.json({
      success: true,
      data: {
        summary
      }
    });

  } catch (error) {
    console.error('Get checkout summary error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while calculating checkout summary'
      }
    });
  }
};

/**
 * Update order status (Admin only)
 * @route PUT /api/orders/:id/status
 * @access Private (Admin only)
 */
const updateOrderStatus = async (req, res) => {
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
    const { status, note, trackingNumber, carrier } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found'
        }
      });
    }

    // Add tracking information if provided
    if (trackingNumber && carrier) {
      await order.addTrackingInfo(trackingNumber, carrier);
    }

    // Update status
    await order.updateStatus(status, note, req.user._id);

    res.json({
      success: true,
      data: {
        order
      },
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while updating order status'
      }
    });
  }
};

/**
 * Get order tracking information
 * @route GET /api/orders/:id/tracking
 * @access Public (with order number) or Private (with order ID)
 */
const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    // Check if it's an order number or order ID
    if (id.startsWith('ORD-')) {
      // Public tracking by order number
      order = await Order.findOne({ orderNumber: id })
        .select('orderNumber status statusHistory shippingInfo totals items user.name createdAt');
    } else {
      // Private tracking by order ID (requires authentication)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required'
          }
        });
      }

      order = await Order.findOne({
        _id: id,
        'user.id': req.user._id
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found'
        }
      });
    }

    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      statusDisplay: order.statusDisplay,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      shippingInfo: {
        method: order.shippingInfo.method,
        trackingNumber: order.shippingInfo.trackingNumber,
        carrier: order.shippingInfo.carrier,
        shippedAt: order.shippingInfo.shippedAt,
        deliveredAt: order.shippingInfo.deliveredAt
      },
      statusHistory: order.statusHistory.map(history => ({
        status: history.status,
        timestamp: history.timestamp,
        note: history.note
      })),
      orderDate: order.createdAt,
      total: order.totals.total,
      itemCount: order.totalItems
    };

    res.json({
      success: true,
      data: {
        tracking: trackingInfo
      }
    });

  } catch (error) {
    console.error('Get order tracking error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching order tracking'
      }
    });
  }
};

/**
 * Get all orders (Admin only)
 * @route GET /api/orders/admin/all
 * @access Private (Admin only)
 */
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      dateFrom,
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get orders
    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('orderNumber user status totals createdAt shippingInfo paymentInfo');

    // Get total count
    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching orders'
      }
    });
  }
};

/**
 * Get order statistics (Admin only)
 * @route GET /api/orders/admin/stats
 * @access Private (Admin only)
 */
const getOrderStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    // Build date range
    const dateRange = {};
    if (dateFrom) dateRange.start = new Date(dateFrom);
    if (dateTo) dateRange.end = new Date(dateTo);

    // Get order statistics
    const stats = await Order.getOrderStats(dateRange);

    // Get status breakdown
    const statusBreakdown = await Order.aggregate([
      ...(Object.keys(dateRange).length > 0 ? [{
        $match: {
          createdAt: {
            ...(dateRange.start && { $gte: dateRange.start }),
            ...(dateRange.end && { $lte: dateRange.end })
          }
        }
      }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find(
      Object.keys(dateRange).length > 0 ? {
        createdAt: {
          ...(dateRange.start && { $gte: dateRange.start }),
          ...(dateRange.end && { $lte: dateRange.end })
        }
      } : {}
    )
    .sort({ createdAt: -1 })
    .limit(10)
    .select('orderNumber user status totals createdAt');

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0
        },
        statusBreakdown,
        recentOrders
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching order statistics'
      }
    });
  }
};

/**
 * Get single order details (Admin only)
 * @route GET /api/orders/admin/:id
 * @access Private (Admin only)
 */
const getOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Get order admin error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching order'
      }
    });
  }
};

/**
 * Update order details (Admin only)
 * @route PUT /api/orders/admin/:id
 * @access Private (Admin only)
 */
const updateOrderAdmin = async (req, res) => {
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
    const updateData = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found'
        }
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'shippingAddress',
      'billingAddress',
      'shippingInfo',
      'notes.internal',
      'notes.customer'
    ];

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (!order[parent]) order[parent] = {};
          order[parent][child] = updateData[field];
        } else {
          order[field] = updateData[field];
        }
      }
    });

    await order.save();

    res.json({
      success: true,
      data: {
        order
      },
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Update order admin error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while updating order'
      }
    });
  }
};

/**
 * Get orders requiring attention (Admin only)
 * @route GET /api/orders/admin/attention
 * @access Private (Admin only)
 */
const getOrdersRequiringAttention = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get orders that need attention
    const ordersNeedingAttention = await Order.find({
      $or: [
        { status: 'pending', createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Pending for more than 24 hours
        { status: 'confirmed', createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) } }, // Confirmed for more than 48 hours
        { 'paymentInfo.status': 'failed' }, // Failed payments
        { 'paymentInfo.status': 'pending', createdAt: { $lt: new Date(Date.now() - 2 * 60 * 60 * 1000) } } // Pending payments for more than 2 hours
      ]
    })
    .sort({ createdAt: 1 }) // Oldest first
    .limit(parseInt(limit))
    .select('orderNumber user status paymentInfo totals createdAt ageInDays');

    res.json({
      success: true,
      data: {
        orders: ordersNeedingAttention,
        count: ordersNeedingAttention.length
      }
    });

  } catch (error) {
    console.error('Get orders requiring attention error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching orders requiring attention'
      }
    });
  }
};

module.exports = {
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
};
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Get user favorites/wishlist data for admin
 * @route GET /api/admin/user-behavior/favorites
 * @access Private (Admin only)
 */
const getUserFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 50, productId, userId } = req.query;

    // Build match conditions
    const matchConditions = {};
    if (userId) {
      matchConditions._id = userId;
    }

    // Aggregation pipeline to get user favorites data
    const pipeline = [
      { $match: matchConditions },
      { $unwind: { path: '$wishlist', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'wishlist.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $match: {
          'product.isActive': true,
          ...(productId && { 'product._id': productId })
        }
      },
      {
        $project: {
          userId: '$_id',
          userEmail: '$email',
          userName: { $concat: ['$profile.firstName', ' ', '$profile.lastName'] },
          productId: '$product._id',
          productName: '$product.name',
          productSlug: '$product.slug',
          productPrice: '$product.price',
          productCategory: '$product.category.name',
          addedAt: '$wishlist.addedAt',
          productImage: {
            $cond: {
              if: { $gt: [{ $size: '$product.images' }, 0] },
              then: { $arrayElemAt: ['$product.images', 0] },
              else: null
            }
          }
        }
      },
      { $sort: { addedAt: -1 } }
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await User.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Add pagination
    pipeline.push(
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    const favorites = await User.aggregate(pipeline);

    // Get summary statistics
    const summaryPipeline = [
      { $match: matchConditions },
      { $unwind: { path: '$wishlist', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'products',
          localField: 'wishlist.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: { 'product.isActive': true } },
      {
        $group: {
          _id: null,
          totalFavorites: { $sum: 1 },
          uniqueUsers: { $addToSet: '$_id' },
          uniqueProducts: { $addToSet: '$product._id' },
          topProducts: {
            $push: {
              productId: '$product._id',
              productName: '$product.name',
              count: 1
            }
          }
        }
      },
      {
        $addFields: {
          uniqueUsers: { $size: '$uniqueUsers' },
          uniqueProducts: { $size: '$uniqueProducts' }
        }
      }
    ];

    const summaryResult = await User.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalFavorites: 0,
      uniqueUsers: 0,
      uniqueProducts: 0,
      topProducts: []
    };

    // Process top products
    const productCounts = {};
    summary.topProducts.forEach(item => {
      if (productCounts[item.productId]) {
        productCounts[item.productId].count++;
      } else {
        productCounts[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          count: 1
        };
      }
    });

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        favorites,
        summary: {
          ...summary,
          topProducts
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user favorites data'
      }
    });
  }
};

/**
 * Get user cart data for admin
 * @route GET /api/admin/user-behavior/carts
 * @access Private (Admin only)
 */
const getUserCarts = async (req, res) => {
  try {
    const { page = 1, limit = 50, productId, userId } = req.query;

    // Note: Since carts are stored in memory, we'll need to get this data differently
    // For now, we'll return analytics data about cart events
    
    const UserAnalytics = require('../models/UserAnalytics');
    
    // Build match conditions
    const matchConditions = {
      'events.type': 'add_to_cart'
    };
    
    if (userId) {
      matchConditions.userId = userId;
    }
    
    if (productId) {
      matchConditions['events.productId'] = productId;
    }

    // Get cart analytics data
    const pipeline = [
      { $match: matchConditions },
      { $unwind: '$events' },
      { $match: { 'events.type': 'add_to_cart' } },
      {
        $group: {
          _id: {
            userId: '$userId',
            productId: '$events.productId'
          },
          userEmail: { $first: '$userEmail' },
          productName: { $first: '$events.metadata.productName' },
          totalQuantity: { $sum: { $ifNull: ['$events.metadata.quantity', 1] } },
          lastAddedAt: { $max: '$events.timestamp' },
          addCount: { $sum: 1 }
        }
      },
      {
        $project: {
          userId: '$_id.userId',
          productId: '$_id.productId',
          userEmail: 1,
          productName: 1,
          totalQuantity: 1,
          lastAddedAt: 1,
          addCount: 1,
          _id: 0
        }
      },
      { $sort: { lastAddedAt: -1 } }
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await UserAnalytics.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Add pagination
    pipeline.push(
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    const cartData = await UserAnalytics.aggregate(pipeline);

    // Get summary statistics
    const summaryPipeline = [
      { $match: { 'events.type': 'add_to_cart' } },
      { $unwind: '$events' },
      { $match: { 'events.type': 'add_to_cart' } },
      {
        $group: {
          _id: null,
          totalCartEvents: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueProducts: { $addToSet: '$events.productId' },
          totalQuantity: { $sum: { $ifNull: ['$events.metadata.quantity', 1] } },
          topProducts: {
            $push: {
              productId: '$events.productId',
              productName: '$events.metadata.productName',
              quantity: { $ifNull: ['$events.metadata.quantity', 1] }
            }
          }
        }
      },
      {
        $addFields: {
          uniqueUsers: { $size: '$uniqueUsers' },
          uniqueProducts: { $size: '$uniqueProducts' }
        }
      }
    ];

    const summaryResult = await UserAnalytics.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalCartEvents: 0,
      uniqueUsers: 0,
      uniqueProducts: 0,
      totalQuantity: 0,
      topProducts: []
    };

    // Process top products
    const productCounts = {};
    summary.topProducts.forEach(item => {
      if (productCounts[item.productId]) {
        productCounts[item.productId].quantity += item.quantity;
        productCounts[item.productId].count++;
      } else {
        productCounts[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          count: 1
        };
      }
    });

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        cartData,
        summary: {
          ...summary,
          topProducts
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user carts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user cart data'
      }
    });
  }
};

module.exports = {
  getUserFavorites,
  getUserCarts
};
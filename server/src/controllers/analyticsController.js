const UserAnalytics = require('../models/UserAnalytics');
const AnalyticsSummary = require('../models/AnalyticsSummary');
const { validationResult } = require('express-validator');

/**
 * @desc    Track analytics event
 * @route   POST /api/analytics/track
 * @access  Public
 */
const trackEvent = async (req, res) => {
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

    const { event, sessionInfo } = req.body;
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Create analytics record
    const analyticsData = {
      sessionId: sessionInfo.sessionId,
      events: [{
        ...event,
        timestamp: new Date()
      }],
      sessionInfo: {
        ...sessionInfo,
        duration: sessionInfo.duration || 0
      },
      userAgent: req.get('User-Agent'),
      ipAddress
    };

    // Only add userId if it exists (for authenticated users)
    if (userId) {
      analyticsData.userId = userId;
    }

    // Validate sessionInfo structure
    if (!analyticsData.sessionInfo || !analyticsData.sessionInfo.deviceInfo) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid session info structure'
        }
      });
    }

    const analytics = new UserAnalytics(analyticsData);
    await analytics.save();

    res.status(201).json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Track event error:', error);
    
    // Log more details for debugging
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to track event',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Track multiple analytics events in batch
 * @route   POST /api/analytics/batch-track
 * @access  Public
 */
const batchTrackEvents = async (req, res) => {
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

    const { events, sessionInfo } = req.body;
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Events array is required and must not be empty'
        }
      });
    }

    // Add timestamps to events
    const timestampedEvents = events.map(event => ({
      ...event,
      timestamp: new Date()
    }));

    // Create analytics record
    const analyticsData = {
      sessionId: sessionInfo.sessionId,
      events: timestampedEvents,
      sessionInfo: {
        ...sessionInfo,
        duration: sessionInfo.duration || 0
      },
      userAgent: req.get('User-Agent'),
      ipAddress
    };

    // Only add userId if it exists (for authenticated users)
    if (userId) {
      analyticsData.userId = userId;
    }

    // Validate sessionInfo structure
    if (!analyticsData.sessionInfo || !analyticsData.sessionInfo.deviceInfo) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid session info structure'
        }
      });
    }

    const analytics = new UserAnalytics(analyticsData);
    await analytics.save();

    res.status(201).json({
      success: true,
      message: `${events.length} events tracked successfully`
    });

  } catch (error) {
    console.error('Batch track events error:', error);
    
    // Log more details for debugging
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to track events',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Get analytics overview for admin dashboard
 * @route   GET /api/admin/analytics/overview
 * @access  Private (Admin)
 */
const getAnalyticsOverview = async (req, res) => {
  try {
    const { startDate, endDate, period = 'day' } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    } else {
      // Default to last 30 days
      dateFilter.createdAt = {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
    }

    // Get basic metrics
    const [
      totalSessions,
      uniqueUsers,
      totalPageViews,
      totalEvents
    ] = await Promise.all([
      UserAnalytics.countDocuments(dateFilter),
      UserAnalytics.distinct('userId', dateFilter).then(users => users.filter(u => u !== null).length),
      UserAnalytics.aggregate([
        { $match: dateFilter },
        { $unwind: '$events' },
        { $match: { 'events.type': 'page_time' } },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0),
      UserAnalytics.aggregate([
        { $match: dateFilter },
        { $unwind: '$events' },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0)
    ]);

    // Get top products
    const topProducts = await UserAnalytics.aggregate([
      { $match: dateFilter },
      { $unwind: '$events' },
      { $match: { 'events.type': 'product_click' } },
      { $group: {
        _id: '$events.productId',
        clicks: { $sum: 1 },
        productName: { $first: '$events.metadata.productName' }
      }},
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);

    // Get top categories
    const topCategories = await UserAnalytics.aggregate([
      { $match: dateFilter },
      { $unwind: '$events' },
      { $match: { 'events.type': 'category_view' } },
      { $group: {
        _id: '$events.categoryId',
        views: { $sum: 1 },
        categoryName: { $first: '$events.metadata.categoryName' }
      }},
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    // Get device breakdown
    const deviceBreakdown = await UserAnalytics.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: '$sessionInfo.deviceInfo.isMobile',
        count: { $sum: 1 }
      }},
      { $project: {
        deviceType: { $cond: { if: '$_id', then: 'mobile', else: 'desktop' } },
        count: 1,
        _id: 0
      }}
    ]);

    // Get traffic sources
    const trafficSources = await UserAnalytics.aggregate([
      { $match: dateFilter },
      { $unwind: '$events' },
      { $group: {
        _id: '$events.metadata.trafficSource',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalSessions,
          uniqueUsers,
          totalPageViews,
          totalEvents,
          avgSessionDuration: 0 // TODO: Calculate from session data
        },
        topProducts,
        topCategories,
        deviceBreakdown,
        trafficSources
      }
    });

  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch analytics overview'
      }
    });
  }
};

/**
 * @desc    Get user interaction analytics
 * @route   GET /api/admin/analytics/user-interactions
 * @access  Private (Admin)
 */
const getUserInteractions = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      eventType, 
      productId, 
      categoryId,
      page = 1, 
      limit = 50 
    } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const matchStage = { $match: dateFilter };
    const pipeline = [matchStage, { $unwind: '$events' }];

    // Add event type filter
    if (eventType) {
      pipeline.push({ $match: { 'events.type': eventType } });
    }

    // Add product filter
    if (productId) {
      pipeline.push({ $match: { 'events.productId': productId } });
    }

    // Add category filter
    if (categoryId) {
      pipeline.push({ $match: { 'events.categoryId': categoryId } });
    }

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await UserAnalytics.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Add pagination and sorting
    pipeline.push(
      { $sort: { 'events.timestamp': -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      { $project: {
        userId: 1,
        sessionId: 1,
        event: '$events',
        sessionInfo: 1,
        userAgent: 1,
        ipAddress: 1,
        createdAt: 1
      }}
    );

    const interactions = await UserAnalytics.aggregate(pipeline);

    res.json({
      success: true,
      data: {
        interactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user interactions error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user interactions'
      }
    });
  }
};

/**
 * @desc    Get product performance analytics
 * @route   GET /api/admin/analytics/product-performance
 * @access  Private (Admin)
 */
const getProductPerformance = async (req, res) => {
  try {
    const { startDate, endDate, productId } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const matchStage = { $match: dateFilter };
    let productFilter = {};
    
    if (productId) {
      productFilter = { 'events.productId': productId };
    }

    const productMetrics = await UserAnalytics.aggregate([
      matchStage,
      { $unwind: '$events' },
      { $match: { 
        'events.productId': { $exists: true },
        ...productFilter
      }},
      { $group: {
        _id: '$events.productId',
        productName: { $first: '$events.metadata.productName' },
        clicks: { 
          $sum: { $cond: [{ $eq: ['$events.type', 'product_click'] }, 1, 0] }
        },
        views: {
          $sum: { $cond: [{ $eq: ['$events.type', 'page_time'] }, 1, 0] }
        },
        addToCarts: { 
          $sum: { $cond: [{ $eq: ['$events.type', 'add_to_cart'] }, 1, 0] }
        },
        purchases: { 
          $sum: { $cond: [{ $eq: ['$events.type', 'purchase'] }, 1, 0] }
        },
        wishlistAdds: { 
          $sum: { $cond: [{ $eq: ['$events.type', 'wishlist_add'] }, 1, 0] }
        },
        totalTimeSpent: {
          $sum: { $ifNull: ['$events.metadata.timeSpent', 0] }
        },
        uniqueUsers: { $addToSet: { $ifNull: ['$userId', '$sessionId'] } },
        totalRevenue: {
          $sum: { 
            $cond: [
              { $eq: ['$events.type', 'purchase'] }, 
              { $ifNull: ['$events.metadata.revenue', 0] }, 
              0
            ]
          }
        }
      }},
      { $addFields: {
        uniqueUsers: { $size: '$uniqueUsers' },
        avgTimeSpent: {
          $cond: [
            { $gt: ['$views', 0] },
            { $divide: ['$totalTimeSpent', '$views'] },
            0
          ]
        },
        conversionRate: {
          $cond: [
            { $gt: ['$clicks', 0] },
            { $multiply: [{ $divide: ['$purchases', '$clicks'] }, 100] },
            0
          ]
        },
        cartConversionRate: {
          $cond: [
            { $gt: ['$addToCarts', 0] },
            { $multiply: [{ $divide: ['$purchases', '$addToCarts'] }, 100] },
            0
          ]
        }
      }},
      { $sort: { clicks: -1 } },
      { $limit: productId ? 1 : 50 }
    ]);

    res.json({
      success: true,
      data: {
        products: productMetrics
      }
    });

  } catch (error) {
    console.error('Get product performance error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch product performance'
      }
    });
  }
};

/**
 * @desc    Get category analytics
 * @route   GET /api/admin/analytics/category-analytics
 * @access  Private (Admin)
 */
const getCategoryAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, categoryId } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const matchStage = { $match: dateFilter };
    let categoryFilter = {};
    
    if (categoryId) {
      categoryFilter = { 'events.categoryId': categoryId };
    }

    const categoryMetrics = await UserAnalytics.aggregate([
      matchStage,
      { $unwind: '$events' },
      { $match: { 
        'events.categoryId': { $exists: true },
        ...categoryFilter
      }},
      { $group: {
        _id: '$events.categoryId',
        categoryName: { $first: '$events.metadata.categoryName' },
        views: { 
          $sum: { $cond: [{ $eq: ['$events.type', 'category_view'] }, 1, 0] }
        },
        uniqueVisitors: { $addToSet: { $ifNull: ['$userId', '$sessionId'] } },
        avgTimeSpent: { 
          $avg: { $ifNull: ['$events.metadata.timeSpent', 0] }
        },
        bounceRate: { $avg: { $ifNull: ['$events.metadata.scrollDepth', 0] } }
      }},
      { $addFields: {
        uniqueVisitors: { $size: '$uniqueVisitors' }
      }},
      { $sort: { views: -1 } },
      { $limit: categoryId ? 1 : 50 }
    ]);

    res.json({
      success: true,
      data: {
        categories: categoryMetrics
      }
    });

  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch category analytics'
      }
    });
  }
};

/**
 * @desc    Get order analytics
 * @route   GET /api/admin/analytics/order-analytics
 * @access  Private (Admin only)
 */
const getOrderAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get order metrics from analytics events
    const orderMetrics = await UserAnalytics.aggregate([
      { $match: dateFilter },
      { $unwind: '$events' },
      { $match: { 'events.type': { $in: ['checkout_start', 'checkout_complete', 'purchase'] } } },
      { $group: {
        _id: null,
        checkoutStarts: { 
          $sum: { $cond: [{ $eq: ['$events.type', 'checkout_start'] }, 1, 0] }
        },
        checkoutCompletes: { 
          $sum: { $cond: [{ $eq: ['$events.type', 'checkout_complete'] }, 1, 0] }
        },
        purchases: { 
          $sum: { $cond: [{ $eq: ['$events.type', 'purchase'] }, 1, 0] }
        },
        totalRevenue: {
          $sum: { 
            $cond: [
              { $eq: ['$events.type', 'purchase'] }, 
              { $ifNull: ['$events.metadata.revenue', 0] }, 
              0
            ]
          }
        },
        avgOrderValue: {
          $avg: { 
            $cond: [
              { $eq: ['$events.type', 'purchase'] }, 
              { $ifNull: ['$events.metadata.revenue', 0] }, 
              null
            ]
          }
        }
      }},
      { $addFields: {
        checkoutConversionRate: {
          $cond: [
            { $gt: ['$checkoutStarts', 0] },
            { $multiply: [{ $divide: ['$checkoutCompletes', '$checkoutStarts'] }, 100] },
            0
          ]
        },
        purchaseConversionRate: {
          $cond: [
            { $gt: ['$checkoutCompletes', 0] },
            { $multiply: [{ $divide: ['$purchases', '$checkoutCompletes'] }, 100] },
            0
          ]
        }
      }}
    ]);

    // Get daily order trends
    const dailyTrends = await UserAnalytics.aggregate([
      { $match: dateFilter },
      { $unwind: '$events' },
      { $match: { 'events.type': 'purchase' } },
      { $group: {
        _id: {
          year: { $year: '$events.timestamp' },
          month: { $month: '$events.timestamp' },
          day: { $dayOfMonth: '$events.timestamp' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: { $ifNull: ['$events.metadata.revenue', 0] } }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      data: {
        metrics: orderMetrics[0] || {
          checkoutStarts: 0,
          checkoutCompletes: 0,
          purchases: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          checkoutConversionRate: 0,
          purchaseConversionRate: 0
        },
        dailyTrends
      }
    });

  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch order analytics'
      }
    });
  }
};

module.exports = {
  trackEvent,
  batchTrackEvents,
  getAnalyticsOverview,
  getUserInteractions,
  getProductPerformance,
  getCategoryAnalytics,
  getOrderAnalytics
};
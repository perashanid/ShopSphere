const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  trackEvent,
  batchTrackEvents,
  getAnalyticsOverview,
  getUserInteractions,
  getProductPerformance,
  getCategoryAnalytics,
  getOrderAnalytics
} = require('../controllers/analyticsController');

// Validation middleware for analytics events
const validateEvent = [
  body('event.type')
    .isIn([
      'product_click', 'category_view', 'page_time', 'add_to_cart',
      'purchase', 'wishlist_add', 'share', 'search', 'filter_apply',
      'checkout_start', 'checkout_complete', 'cart_abandon'
    ])
    .withMessage('Invalid event type'),
  body('sessionInfo.sessionId')
    .notEmpty()
    .withMessage('Session ID is required'),
  body('sessionInfo.startTime')
    .isISO8601()
    .withMessage('Valid start time is required')
];

const validateBatchEvents = [
  body('events')
    .isArray({ min: 1 })
    .withMessage('Events array is required and must not be empty'),
  body('events.*.type')
    .isIn([
      'product_click', 'category_view', 'page_time', 'add_to_cart',
      'purchase', 'wishlist_add', 'share', 'search', 'filter_apply',
      'checkout_start', 'checkout_complete', 'cart_abandon'
    ])
    .withMessage('Invalid event type'),
  body('sessionInfo.sessionId')
    .notEmpty()
    .withMessage('Session ID is required'),
  body('sessionInfo.startTime')
    .isISO8601()
    .withMessage('Valid start time is required')
];

// Public analytics tracking routes
/**
 * @route   POST /api/analytics/track
 * @desc    Track single analytics event
 * @access  Public (with optional auth)
 */
router.post('/track',
  optionalAuth,
  validateEvent,
  trackEvent
);

/**
 * @route   POST /api/analytics/batch-track
 * @desc    Track multiple analytics events
 * @access  Public (with optional auth)
 */
router.post('/batch-track',
  optionalAuth,
  validateBatchEvents,
  batchTrackEvents
);

// Admin analytics routes
/**
 * @route   GET /api/analytics/admin/overview
 * @desc    Get analytics overview for admin dashboard
 * @access  Private (Admin only)
 */
router.get('/admin/overview',
  authenticate,
  authorize('admin'),
  getAnalyticsOverview
);

/**
 * @route   GET /api/analytics/admin/user-interactions
 * @desc    Get user interaction analytics with filtering
 * @access  Private (Admin only)
 */
router.get('/admin/user-interactions',
  authenticate,
  authorize('admin'),
  getUserInteractions
);

/**
 * @route   GET /api/analytics/admin/product-performance
 * @desc    Get product performance analytics
 * @access  Private (Admin only)
 */
router.get('/admin/product-performance',
  authenticate,
  authorize('admin'),
  getProductPerformance
);

/**
 * @route   GET /api/analytics/admin/category-analytics
 * @desc    Get category analytics
 * @access  Private (Admin only)
 */
router.get('/admin/category-analytics',
  authenticate,
  authorize('admin'),
  getCategoryAnalytics
);

/**
 * @route   GET /api/analytics/admin/order-analytics
 * @desc    Get order analytics
 * @access  Private (Admin only)
 */
router.get('/admin/order-analytics',
  authenticate,
  authorize('admin'),
  getOrderAnalytics
);

/**
 * @route   POST /api/analytics/admin/generate-sample-data
 * @desc    Generate sample analytics data for testing
 * @access  Private (Admin only)
 */
router.post('/admin/generate-sample-data',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { generateSampleAnalytics } = require('../utils/generateSampleAnalytics');
      await generateSampleAnalytics();
      res.json({
        success: true,
        message: 'Sample analytics data generated successfully'
      });
    } catch (error) {
      console.error('Error generating sample data:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate sample data'
        }
      });
    }
  }
);

/**
 * @route   DELETE /api/analytics/admin/clear-data
 * @desc    Clear all analytics data
 * @access  Private (Admin only)
 */
router.delete('/admin/clear-data',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const UserAnalytics = require('../models/UserAnalytics');
      await UserAnalytics.deleteMany({});
      res.json({
        success: true,
        message: 'All analytics data cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing analytics data:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to clear analytics data'
        }
      });
    }
  }
);

module.exports = router;
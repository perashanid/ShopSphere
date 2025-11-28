const mongoose = require('mongoose');

const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous tracking
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  events: [{
    type: {
      type: String,
      enum: [
        'product_click', 'category_view', 'page_time', 'add_to_cart', 
        'purchase', 'wishlist_add', 'share', 'search', 'filter_apply',
        'checkout_start', 'checkout_complete', 'cart_abandon'
      ],
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    metadata: {
      productName: String,
      categoryName: String,
      timeSpent: Number, // in seconds
      pageUrl: String,
      referrer: String,
      scrollDepth: Number, // percentage
      interactionCount: Number,
      searchQuery: String,
      filterCriteria: Object,
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet']
      },
      browserInfo: {
        name: String,
        version: String
      },
      screenResolution: String,
      location: {
        country: String,
        city: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      },
      trafficSource: {
        type: String,
        enum: ['direct', 'search', 'social', 'email', 'referral', 'paid']
      },
      campaignData: {
        source: String,
        medium: String,
        campaign: String,
        term: String,
        content: String
      }
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  }],
  sessionInfo: {
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    duration: Number, // in seconds
    pageViews: {
      type: Number,
      default: 0
    },
    isReturningUser: {
      type: Boolean,
      default: false
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
      isMobile: Boolean
    }
  },
  userAgent: String,
  ipAddress: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000 // 90 days TTL (extended for better analytics)
  }
}, {
  timestamps: false
});

// Comprehensive indexes for efficient querying
userAnalyticsSchema.index({ userId: 1, 'events.timestamp': -1 });
userAnalyticsSchema.index({ 'events.productId': 1, 'events.timestamp': -1 });
userAnalyticsSchema.index({ 'events.categoryId': 1, 'events.timestamp': -1 });
userAnalyticsSchema.index({ 'events.type': 1, 'events.timestamp': -1 });
userAnalyticsSchema.index({ sessionId: 1, 'sessionInfo.startTime': -1 });
userAnalyticsSchema.index({ 'events.metadata.deviceType': 1, 'events.timestamp': -1 });
userAnalyticsSchema.index({ 'events.metadata.trafficSource': 1, 'events.timestamp': -1 });
userAnalyticsSchema.index({ 'events.metadata.location.country': 1, 'events.timestamp': -1 });
// Note: createdAt index is automatically created by the TTL (expires) property

module.exports = mongoose.model('UserAnalytics', userAnalyticsSchema);
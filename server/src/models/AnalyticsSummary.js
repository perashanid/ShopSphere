const mongoose = require('mongoose');

const analyticsSummarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  period: {
    type: String,
    enum: ['hour', 'day', 'week', 'month'],
    required: true
  },
  metrics: {
    totalUsers: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    totalPageViews: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    cartAbandonmentRate: { type: Number, default: 0 }
  },
  topProducts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    views: Number,
    clicks: Number,
    conversions: Number,
    revenue: Number
  }],
  topCategories: [{
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    views: Number,
    timeSpent: Number,
    conversionRate: Number
  }],
  trafficSources: [{
    source: String,
    users: Number,
    sessions: Number,
    conversionRate: Number,
    revenue: Number
  }],
  deviceBreakdown: [{
    deviceType: String,
    users: Number,
    sessions: Number,
    conversionRate: Number
  }],
  geographicData: [{
    country: String,
    users: Number,
    sessions: Number,
    revenue: Number
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient aggregation queries
analyticsSummarySchema.index({ date: 1, period: 1 });
analyticsSummarySchema.index({ period: 1, date: -1 });

module.exports = mongoose.model('AnalyticsSummary', analyticsSummarySchema);
const mongoose = require('mongoose');

const analyticsAlertsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  metric: {
    type: String,
    enum: [
      'conversion_rate', 'bounce_rate', 'cart_abandonment_rate',
      'average_session_duration', 'total_revenue', 'unique_users',
      'page_views', 'product_views', 'category_views'
    ],
    required: true
  },
  condition: {
    operator: {
      type: String,
      enum: ['greater_than', 'less_than', 'equals', 'not_equals'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  frequency: {
    type: String,
    enum: ['real_time', 'hourly', 'daily', 'weekly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AnalyticsAlerts', analyticsAlertsSchema);
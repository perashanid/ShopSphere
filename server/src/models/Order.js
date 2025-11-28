const mongoose = require('mongoose');

// Order Item subdocument schema
const orderItemSchema = new mongoose.Schema({
  product: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      trim: true
    },
    image: {
      url: {
        type: String,
        required: [true, 'Product image URL is required']
      },
      alt: {
        type: String,
        required: [true, 'Product image alt text is required']
      }
    }
  },
  variant: {
    id: {
      type: mongoose.Schema.Types.ObjectId
    },
    name: {
      type: String,
      trim: true
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true
    },
    attributes: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      value: {
        type: String,
        required: true,
        trim: true
      }
    }]
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  }
}, { _id: true });

// Address subdocument schema (reused from User model)
const addressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  address1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    maxlength: [100, 'Address line 1 cannot exceed 100 characters']
  },
  address2: {
    type: String,
    trim: true,
    maxlength: [100, 'Address line 2 cannot exceed 100 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State/Province is required'],
    trim: true,
    maxlength: [50, 'State/Province cannot exceed 50 characters']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    maxlength: [20, 'Postal code cannot exceed 20 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters'],
    default: 'United States'
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  }
}, { _id: false });

// Payment Information subdocument schema
const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay'],
    lowercase: true
  },
  status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
    lowercase: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  paymentIntentId: {
    type: String,
    trim: true
  },
  last4: {
    type: String,
    maxlength: [4, 'Last 4 digits cannot exceed 4 characters']
  },
  brand: {
    type: String,
    trim: true,
    lowercase: true
  },
  paidAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
    default: 0
  }
}, { _id: false });

// Order Totals subdocument schema
const orderTotalsSchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: [true, 'Tax amount is required'],
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  taxRate: {
    type: Number,
    min: [0, 'Tax rate cannot be negative'],
    max: [1, 'Tax rate cannot exceed 100%'],
    default: 0
  },
  shipping: {
    type: Number,
    required: [true, 'Shipping cost is required'],
    min: [0, 'Shipping cost cannot be negative'],
    default: 0
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    default: 0
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  }
}, { _id: false });

// Shipping Information subdocument schema
const shippingInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    required: [true, 'Shipping method is required'],
    trim: true
  },
  cost: {
    type: Number,
    required: [true, 'Shipping cost is required'],
    min: [0, 'Shipping cost cannot be negative']
  },
  estimatedDelivery: {
    min: {
      type: Number,
      min: [1, 'Minimum delivery days must be at least 1']
    },
    max: {
      type: Number,
      min: [1, 'Maximum delivery days must be at least 1']
    }
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    trim: true,
    lowercase: true
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
}, { _id: false });

// Order Status History subdocument schema
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    lowercase: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Status note cannot exceed 500 characters']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: true });

// Main Order schema
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    trim: true,
    uppercase: true
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    }
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  shippingAddress: {
    type: addressSchema,
    required: [true, 'Shipping address is required']
  },
  billingAddress: {
    type: addressSchema,
    required: [true, 'Billing address is required']
  },
  paymentInfo: {
    type: paymentInfoSchema,
    required: [true, 'Payment information is required']
  },
  shippingInfo: {
    type: shippingInfoSchema,
    required: [true, 'Shipping information is required']
  },
  totals: {
    type: orderTotalsSchema,
    required: [true, 'Order totals are required']
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    lowercase: true
  },
  statusHistory: [statusHistorySchema],
  notes: {
    customer: {
      type: String,
      trim: true,
      maxlength: [1000, 'Customer notes cannot exceed 1000 characters']
    },
    internal: {
      type: String,
      trim: true,
      maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
    }
  },
  couponCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  isGuestOrder: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancel reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for efficient querying
orderSchema.index({ 'user.id': 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ 'paymentInfo.transactionId': 1 });
orderSchema.index({ 'shippingInfo.trackingNumber': 1 });

// Virtual for total item count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for estimated delivery date
orderSchema.virtual('estimatedDeliveryDate').get(function() {
  if (!this.shippingInfo.estimatedDelivery || !this.shippingInfo.shippedAt) {
    return null;
  }
  
  const shippedDate = new Date(this.shippingInfo.shippedAt);
  const maxDays = this.shippingInfo.estimatedDelivery.max || this.shippingInfo.estimatedDelivery.min || 7;
  return new Date(shippedDate.getTime() + (maxDays * 24 * 60 * 60 * 1000));
});

// Virtual for order status display
orderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  // Calculate totals if items have changed
  if (this.isModified('items') || this.isNew) {
    this.totals.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.totals.total = this.totals.subtotal + this.totals.tax + this.totals.shipping - this.totals.discount;
  }
  
  next();
});

// Pre-save middleware to track status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  
  // Set timestamps for specific status changes
  if (this.isModified('status')) {
    switch (this.status) {
      case 'shipped':
        if (!this.shippingInfo.shippedAt) {
          this.shippingInfo.shippedAt = new Date();
        }
        break;
      case 'delivered':
        if (!this.shippingInfo.deliveredAt) {
          this.shippingInfo.deliveredAt = new Date();
        }
        break;
      case 'cancelled':
        if (!this.cancelledAt) {
          this.cancelledAt = new Date();
        }
        break;
    }
  }
  
  next();
});

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  
  if (note || updatedBy) {
    this.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: note,
      updatedBy: updatedBy
    });
  }
  
  return this.save();
};

// Instance method to add tracking information
orderSchema.methods.addTrackingInfo = function(trackingNumber, carrier) {
  this.shippingInfo.trackingNumber = trackingNumber;
  this.shippingInfo.carrier = carrier;
  
  if (this.status === 'processing') {
    this.status = 'shipped';
  }
  
  return this.save();
};

// Instance method to calculate refund amount
orderSchema.methods.calculateRefundAmount = function(itemsToRefund = null) {
  if (!itemsToRefund) {
    return this.totals.total - this.paymentInfo.refundAmount;
  }
  
  const refundAmount = itemsToRefund.reduce((sum, refundItem) => {
    const orderItem = this.items.find(item => 
      item._id.toString() === refundItem.itemId.toString()
    );
    if (orderItem) {
      const refundQty = Math.min(refundItem.quantity, orderItem.quantity);
      return sum + (orderItem.unitPrice * refundQty);
    }
    return sum;
  }, 0);
  
  return refundAmount;
};

// Instance method to process refund
orderSchema.methods.processRefund = function(refundAmount, reason) {
  this.paymentInfo.refundAmount += refundAmount;
  this.paymentInfo.refundedAt = new Date();
  
  if (this.paymentInfo.refundAmount >= this.totals.total) {
    this.paymentInfo.status = 'refunded';
    this.status = 'refunded';
  } else {
    this.paymentInfo.status = 'partially_refunded';
  }
  
  this.statusHistory.push({
    status: this.status,
    timestamp: new Date(),
    note: `Refund processed: $${refundAmount.toFixed(2)}. Reason: ${reason}`
  });
  
  return this.save();
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId, options = {}) {
  return this.find({ 'user.id': userId }, null, {
    sort: { createdAt: -1 },
    ...options
  });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status, options = {}) {
  return this.find({ status }, null, options);
};

// Static method to find orders by date range
orderSchema.statics.findByDateRange = function(startDate, endDate, options = {}) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }, null, options);
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function(dateRange = {}) {
  const matchStage = {};
  if (dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totals.total' },
        averageOrderValue: { $avg: '$totals.total' },
        statusBreakdown: {
          $push: '$status'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalOrders: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        statusBreakdown: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Address subdocument schema
const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['shipping', 'billing', 'both'],
    default: 'both'
  },
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
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { 
  _id: true,
  timestamps: true 
});

// User profile subdocument schema
const userProfileSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    lowercase: true
  },
  avatar: {
    type: String,
    trim: true
  }
}, { _id: false });

// User preferences subdocument schema
const userPreferencesSchema = new mongoose.Schema({
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    maxlength: [3, 'Currency code must be 3 characters']
  },
  language: {
    type: String,
    default: 'en',
    lowercase: true,
    maxlength: [5, 'Language code cannot exceed 5 characters']
  },
  newsletter: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  emailNotifications: {
    orderUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    productRecommendations: {
      type: Boolean,
      default: false
    }
  }
}, { _id: false });

// Password reset token subdocument schema
const passwordResetSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Email verification subdocument schema
const emailVerificationSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Main User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    maxlength: [100, 'Email cannot exceed 100 characters'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  profile: {
    type: userProfileSchema,
    required: true
  },
  addresses: [addressSchema],
  preferences: {
    type: userPreferencesSchema,
    default: () => ({})
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'moderator'],
    default: 'customer',
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerification: emailVerificationSchema,
  passwordReset: passwordResetSchema,
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '7d' // Auto-delete after 7 days
    }
  }],
  wishlist: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.passwordReset;
      delete ret.emailVerification;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Create indexes for efficient querying
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`.trim();
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for default shipping address
userSchema.virtual('defaultShippingAddress').get(function() {
  return this.addresses.find(addr => 
    addr.isDefault && (addr.type === 'shipping' || addr.type === 'both')
  );
});

// Virtual for default billing address
userSchema.virtual('defaultBillingAddress').get(function() {
  return this.addresses.find(addr => 
    addr.isDefault && (addr.type === 'billing' || addr.type === 'both')
  );
});

// Virtual for admin status
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to ensure only one default address per type
userSchema.pre('save', function(next) {
  if (this.isModified('addresses')) {
    const shippingDefaults = this.addresses.filter(addr => 
      addr.isDefault && (addr.type === 'shipping' || addr.type === 'both')
    );
    const billingDefaults = this.addresses.filter(addr => 
      addr.isDefault && (addr.type === 'billing' || addr.type === 'both')
    );
    
    // Ensure only one default shipping address
    if (shippingDefaults.length > 1) {
      shippingDefaults.slice(1).forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    // Ensure only one default billing address
    if (billingDefaults.length > 1) {
      billingDefaults.slice(1).forEach(addr => {
        addr.isDefault = false;
      });
    }
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    throw new Error('Password not available for comparison');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT access token
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    config.jwtSecret,
    { 
      expiresIn: config.jwtExpire,
      issuer: 'ecommerce-api',
      audience: 'ecommerce-client'
    }
  );
};

// Instance method to generate JWT refresh token
userSchema.methods.generateRefreshToken = function() {
  const refreshToken = jwt.sign(
    { 
      id: this._id,
      type: 'refresh'
    },
    config.jwtRefreshSecret,
    { 
      expiresIn: config.jwtRefreshExpire,
      issuer: 'ecommerce-api',
      audience: 'ecommerce-client'
    }
  );
  
  // Store refresh token
  this.refreshTokens.push({ token: refreshToken });
  
  // Keep only the last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  return refreshToken;
};

// Instance method to revoke refresh token
userSchema.methods.revokeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Instance method to revoke all refresh tokens
userSchema.methods.revokeAllRefreshTokens = function() {
  this.refreshTokens = [];
  return this.save();
};

// Instance method to handle failed login attempts
userSchema.methods.handleFailedLogin = async function() {
  // If account is already locked and lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to handle successful login
userSchema.methods.handleSuccessfulLogin = function() {
  // Reset login attempts and update last login
  const updates = {
    $set: { lastLogin: Date.now() },
    $unset: { loginAttempts: 1, lockUntil: 1 }
  };
  
  return this.updateOne(updates);
};

// Instance method to add address
userSchema.methods.addAddress = function(addressData) {
  // If this is the first address or marked as default, make it default
  if (this.addresses.length === 0 || addressData.isDefault) {
    // Remove default status from existing addresses of the same type
    this.addresses.forEach(addr => {
      if (addr.type === addressData.type || 
          addr.type === 'both' || 
          addressData.type === 'both') {
        addr.isDefault = false;
      }
    });
    addressData.isDefault = true;
  }
  
  this.addresses.push(addressData);
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function(options = {}) {
  return this.find({ isActive: true }, null, options);
};

module.exports = mongoose.model('User', userSchema);
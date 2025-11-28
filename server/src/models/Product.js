const mongoose = require('mongoose');

// Product Image subdocument schema
const productImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Image URL is required']
  },
  alt: {
    type: String,
    required: [true, 'Image alt text is required']
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number
  },
  height: {
    type: Number
  }
}, { _id: true });

// Product Variant Attribute subdocument schema
const variantAttributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Attribute name is required'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Attribute value is required'],
    trim: true
  }
}, { _id: false });

// Product Variant subdocument schema
const productVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Variant name is required'],
    trim: true
  },
  price: {
    type: Number,
    min: [0, 'Variant price cannot be negative']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
    uppercase: true
  },
  inventory: {
    type: Number,
    required: [true, 'Inventory count is required'],
    min: [0, 'Inventory cannot be negative'],
    default: 0
  },
  attributes: [variantAttributeSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  _id: true,
  timestamps: true 
});

// Category reference subdocument schema
const categoryRefSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category ID is required']
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    trim: true,
    lowercase: true
  }
}, { _id: false });

// Inventory information subdocument schema
const inventorySchema = new mongoose.Schema({
  count: {
    type: Number,
    required: [true, 'Inventory count is required'],
    min: [0, 'Inventory count cannot be negative'],
    default: 0
  },
  trackInventory: {
    type: Boolean,
    default: true
  },
  allowBackorder: {
    type: Boolean,
    default: false
  },
  lowStockThreshold: {
    type: Number,
    min: [0, 'Low stock threshold cannot be negative'],
    default: 5
  }
}, { _id: false });

// SEO metadata subdocument schema
const seoSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, { _id: false });

// Main Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Product description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    index: true
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare at price cannot be negative'],
    validate: {
      validator: function(value) {
        return !value || value > this.price;
      },
      message: 'Compare at price must be greater than regular price'
    }
  },
  images: {
    type: [productImageSchema],
    validate: {
      validator: function(images) {
        return images && images.length > 0;
      },
      message: 'At least one product image is required'
    }
  },
  category: {
    type: categoryRefSchema,
    required: [true, 'Product category is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true
  }],
  variants: [productVariantSchema],
  inventory: {
    type: inventorySchema,
    default: () => ({})
  },
  seo: {
    type: seoSchema,
    default: () => ({})
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound indexes for efficient querying
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ 'category.id': 1, price: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0];
});

// Virtual for availability status
productSchema.virtual('isAvailable').get(function() {
  if (!this.isActive) return false;
  if (!this.inventory.trackInventory) return true;
  return this.inventory.count > 0 || this.inventory.allowBackorder;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (!this.inventory.trackInventory) return 'in_stock';
  if (this.inventory.count === 0) {
    return this.inventory.allowBackorder ? 'backorder' : 'out_of_stock';
  }
  if (this.inventory.count <= this.inventory.lowStockThreshold) {
    return 'low_stock';
  }
  return 'in_stock';
});

// Virtual for admin summary display
productSchema.virtual('adminSummary').get(function() {
  return {
    id: this._id,
    name: this.name,
    price: this.price,
    category: this.category.name,
    stock: this.inventory.count,
    status: this.isActive ? 'Active' : 'Inactive',
    featured: this.featured,
    createdAt: this.createdAt
  };
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length === 0) {
      this.images[0].isPrimary = true;
    } else if (primaryImages.length > 1) {
      this.images.forEach((img, index) => {
        img.isPrimary = index === 0;
      });
    }
  }
  
  next();
});

// Instance method to check if product is in stock
productSchema.methods.isInStock = function(quantity = 1) {
  if (!this.inventory.trackInventory) return true;
  if (this.inventory.allowBackorder) return true;
  return this.inventory.count >= quantity;
};

// Instance method to reserve inventory
productSchema.methods.reserveInventory = function(quantity) {
  if (this.inventory.trackInventory && !this.inventory.allowBackorder) {
    if (this.inventory.count < quantity) {
      throw new Error('Insufficient inventory');
    }
    this.inventory.count -= quantity;
  }
  return this.save();
};

// Instance method to release inventory
productSchema.methods.releaseInventory = function(quantity) {
  if (this.inventory.trackInventory) {
    this.inventory.count += quantity;
  }
  return this.save();
};

// Static method to find products by category
productSchema.statics.findByCategory = function(categoryId, options = {}) {
  const query = { 
    'category.id': categoryId, 
    isActive: true 
  };
  
  return this.find(query, null, options);
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20);
};

module.exports = mongoose.model('Product', productSchema);
const mongoose = require('mongoose');

// Category Image subdocument schema
const categoryImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Image URL is required']
  },
  alt: {
    type: String,
    required: [true, 'Image alt text is required']
  },
  type: {
    type: String,
    enum: ['banner', 'icon', 'thumbnail'],
    default: 'thumbnail'
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

// Main Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Category description cannot exceed 500 characters']
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  level: {
    type: Number,
    default: 0,
    min: [0, 'Category level cannot be negative'],
    max: [5, 'Category level cannot exceed 5'],
    index: true
  },
  path: {
    type: String,
    trim: true,
    index: true
  },
  images: {
    banner: categoryImageSchema,
    icon: categoryImageSchema,
    thumbnail: categoryImageSchema
  },
  displayOrder: {
    type: Number,
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  showInNavigation: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0,
    min: [0, 'Product count cannot be negative']
  },
  seo: {
    type: seoSchema,
    default: () => ({})
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for efficient querying
categorySchema.index({ parent: 1, displayOrder: 1 });
categorySchema.index({ level: 1, isActive: 1 });
categorySchema.index({ isFeatured: 1, isActive: 1 });
categorySchema.index({ showInNavigation: 1, isActive: 1, displayOrder: 1 });
categorySchema.index({ name: 'text', description: 'text' });

// Virtual for full path display
categorySchema.virtual('fullPath').get(function() {
  return this.path ? this.path.replace(/,/g, ' > ') : this.name;
});

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products in this category
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category.id'
});

// Virtual for breadcrumb navigation
categorySchema.virtual('breadcrumbs').get(function() {
  if (!this.path) return [{ name: this.name, slug: this.slug }];
  
  const pathParts = this.path.split(',');
  const breadcrumbs = pathParts.map(part => {
    const [name, slug] = part.split('|');
    return { name, slug };
  });
  
  breadcrumbs.push({ name: this.name, slug: this.slug });
  return breadcrumbs;
});

// Pre-save middleware to generate slug and manage hierarchy
categorySchema.pre('save', async function(next) {
  try {
    // Generate slug from name if not provided
    if (this.isModified('name') && !this.slug) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Ensure slug uniqueness
      let counter = 1;
      let originalSlug = this.slug;
      while (await this.constructor.findOne({ slug: this.slug, _id: { $ne: this._id } })) {
        this.slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }
    
    // Handle parent relationship and hierarchy
    if (this.isModified('parent') || this.isNew) {
      if (this.parent) {
        // Prevent circular references
        if (this.parent.toString() === this._id.toString()) {
          throw new Error('Category cannot be its own parent');
        }
        
        // Get parent category
        const parentCategory = await this.constructor.findById(this.parent);
        if (!parentCategory) {
          throw new Error('Parent category not found');
        }
        
        // Check for circular reference in ancestry
        let currentParent = parentCategory;
        while (currentParent.parent) {
          if (currentParent.parent.toString() === this._id.toString()) {
            throw new Error('Circular reference detected in category hierarchy');
          }
          currentParent = await this.constructor.findById(currentParent.parent);
          if (!currentParent) break;
        }
        
        // Set level and path
        this.level = parentCategory.level + 1;
        this.path = parentCategory.path 
          ? `${parentCategory.path},${parentCategory.name}|${parentCategory.slug}`
          : `${parentCategory.name}|${parentCategory.slug}`;
      } else {
        // Root category
        this.level = 0;
        this.path = '';
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update children paths when parent changes
categorySchema.post('save', async function(doc) {
  if (doc.isModified('name') || doc.isModified('slug') || doc.isModified('parent')) {
    // Update all children categories' paths
    await updateChildrenPaths(doc);
  }
});

// Helper function to recursively update children paths
async function updateChildrenPaths(category) {
  const children = await category.constructor.find({ parent: category._id });
  
  for (const child of children) {
    const newPath = category.path 
      ? `${category.path},${category.name}|${category.slug}`
      : `${category.name}|${category.slug}`;
    
    child.path = newPath;
    child.level = category.level + 1;
    await child.save();
    
    // Recursively update grandchildren
    await updateChildrenPaths(child);
  }
}

// Pre-remove middleware to handle category deletion
categorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Check if category has children
    const childrenCount = await this.constructor.countDocuments({ parent: this._id });
    if (childrenCount > 0) {
      throw new Error('Cannot delete category with subcategories. Please delete or move subcategories first.');
    }
    
    // Check if category has products
    const Product = mongoose.model('Product');
    const productCount = await Product.countDocuments({ 'category.id': this._id });
    if (productCount > 0) {
      throw new Error('Cannot delete category with products. Please move or delete products first.');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to get all ancestors
categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;
  
  while (current.parent) {
    const parent = await this.constructor.findById(current.parent);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }
  
  return ancestors;
};

// Instance method to get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const getChildren = async (categoryId) => {
    const children = await this.constructor.find({ parent: categoryId });
    for (const child of children) {
      descendants.push(child);
      await getChildren(child._id);
    }
  };
  
  await getChildren(this._id);
  return descendants;
};

// Instance method to move category to new parent
categorySchema.methods.moveTo = async function(newParentId) {
  if (newParentId && newParentId.toString() === this._id.toString()) {
    throw new Error('Category cannot be moved to itself');
  }
  
  // Check for circular reference
  if (newParentId) {
    const descendants = await this.getDescendants();
    const descendantIds = descendants.map(d => d._id.toString());
    if (descendantIds.includes(newParentId.toString())) {
      throw new Error('Cannot move category to its own descendant');
    }
  }
  
  this.parent = newParentId || null;
  return this.save();
};

// Instance method to update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  this.productCount = await Product.countDocuments({ 
    'category.id': this._id,
    isActive: true 
  });
  return this.save();
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function(parentId = null, maxDepth = null) {
  const query = { parent: parentId, isActive: true };
  if (maxDepth !== null) {
    query.level = { $lte: maxDepth };
  }
  
  const categories = await this.find(query).sort({ displayOrder: 1, name: 1 });
  
  // Recursively build tree
  for (const category of categories) {
    if (maxDepth === null || category.level < maxDepth) {
      category.children = await this.getCategoryTree(category._id, maxDepth);
    }
  }
  
  return categories;
};

// Static method to get navigation categories
categorySchema.statics.getNavigationCategories = function() {
  return this.find({
    showInNavigation: true,
    isActive: true,
    level: { $lte: 2 } // Only show up to 2 levels in navigation
  }).sort({ level: 1, displayOrder: 1, name: 1 });
};

// Static method to get featured categories
categorySchema.statics.getFeaturedCategories = function(limit = 6) {
  return this.find({
    isFeatured: true,
    isActive: true
  })
  .sort({ displayOrder: 1, name: 1 })
  .limit(limit);
};

// Static method to search categories
categorySchema.statics.searchCategories = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 10);
};

// Static method to get category statistics
categorySchema.statics.getCategoryStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        featuredCount: {
          $sum: { $cond: ['$isFeatured', 1, 0] }
        },
        totalProducts: { $sum: '$productCount' }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        level: '$_id',
        _id: 0,
        count: 1,
        activeCount: 1,
        featuredCount: 1,
        totalProducts: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Category', categorySchema);
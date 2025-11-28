const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronic devices and gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500'
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home and garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports equipment and activewear',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
  }
];

const products = [
  // Electronics
  {
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
    price: 299.99,
    compareAtPrice: 399.99,
    category: 'electronics',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&crop=center',
        alt: 'Premium Wireless Headphones',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop&crop=center',
        alt: 'Headphones Side View',
        isPrimary: false
      }
    ],
    tags: ['electronics', 'headphones', 'wireless'],
    featured: true,
    inventory: {
      count: 15,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 5
    }
  },
  {
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    description: 'Advanced fitness tracking with heart rate monitoring and GPS.',
    price: 199.99,
    category: 'electronics',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&crop=center',
        alt: 'Smart Fitness Watch',
        isPrimary: true
      }
    ],
    tags: ['electronics', 'fitness', 'watch'],
    featured: true,
    inventory: {
      count: 8,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 5
    }
  },
  {
    name: 'Bluetooth Speaker',
    slug: 'bluetooth-speaker',
    description: 'Portable Bluetooth speaker with excellent sound quality and long battery life.',
    price: 79.99,
    category: 'electronics',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop&crop=center',
        alt: 'Bluetooth Speaker',
        isPrimary: true
      }
    ],
    tags: ['electronics', 'speaker', 'bluetooth'],
    featured: true,
    inventory: {
      count: 12,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 5
    }
  },
  {
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    description: 'The latest iPhone with advanced camera system and A17 Pro chip',
    price: 999.99,
    category: 'electronics',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        alt: 'iPhone 15 Pro front view',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        alt: 'iPhone 15 Pro back view',
        isPrimary: false
      }
    ],
    inventory: {
      count: 50,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 5
    },
    featured: true,
    tags: ['apple', 'smartphone', 'electronics', 'mobile']
  },
  {
    name: 'MacBook Air M2',
    slug: 'macbook-air-m2',
    description: 'Supercharged by M2 chip. Incredibly thin and light laptop',
    price: 1199.99,
    category: 'electronics',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        alt: 'MacBook Air M2 laptop',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
        alt: 'MacBook Air M2 side view',
        isPrimary: false
      }
    ],
    inventory: {
      count: 30,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 3
    },
    featured: true,
    tags: ['apple', 'laptop', 'electronics', 'computer']
  },
  {
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    description: 'Industry-leading noise canceling headphones',
    price: 399.99,
    category: 'electronics',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        alt: 'Sony WH-1000XM5 headphones',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
        alt: 'Sony headphones side view',
        isPrimary: false
      }
    ],
    inventory: {
      count: 75,
      trackInventory: true,
      allowBackorder: true,
      lowStockThreshold: 10
    },
    featured: false,
    tags: ['sony', 'headphones', 'audio', 'wireless']
  },
  
  // Fashion
  {
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-tshirt',
    description: 'Comfortable organic cotton t-shirt in various colors and sizes.',
    price: 29.99,
    category: 'fashion',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&crop=center',
        alt: 'Organic Cotton T-Shirt',
        isPrimary: true
      }
    ],
    tags: ['fashion', 'organic', 'cotton'],
    featured: false,
    inventory: {
      count: 50,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 5
    }
  },
  {
    name: 'Leather Crossbody Bag',
    slug: 'leather-crossbody-bag',
    description: 'Elegant leather crossbody bag perfect for everyday use and special occasions.',
    price: 129.99,
    compareAtPrice: 159.99,
    category: 'fashion',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&crop=center',
        alt: 'Leather Crossbody Bag',
        isPrimary: true
      }
    ],
    tags: ['fashion', 'leather', 'bag'],
    featured: true,
    inventory: {
      count: 12,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 5
    }
  },
  {
    name: 'Premium Cotton T-Shirt',
    slug: 'premium-cotton-tshirt',
    description: 'Soft, comfortable cotton t-shirt perfect for everyday wear',
    price: 29.99,
    category: 'fashion',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        alt: 'Premium cotton t-shirt',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500',
        alt: 'T-shirt detail view',
        isPrimary: false
      }
    ],
    inventory: {
      count: 100,
      trackInventory: true,
      allowBackorder: true,
      lowStockThreshold: 15
    },
    featured: true,
    tags: ['clothing', 'tshirt', 'cotton', 'casual']
  },
  {
    name: 'Designer Jeans',
    slug: 'designer-jeans',
    description: 'Premium denim jeans with perfect fit and style',
    price: 89.99,
    category: 'fashion',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        alt: 'Designer jeans',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=500',
        alt: 'Jeans detail view',
        isPrimary: false
      }
    ],
    inventory: {
      count: 60,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 8
    },
    featured: false,
    tags: ['clothing', 'jeans', 'denim', 'fashion']
  },
  
  // Home & Garden
  {
    name: 'Minimalist Desk Lamp',
    slug: 'minimalist-desk-lamp',
    description: 'Modern LED desk lamp with adjustable brightness and sleek design.',
    price: 89.99,
    compareAtPrice: 119.99,
    category: 'home-garden',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=center',
        alt: 'Minimalist Desk Lamp',
        isPrimary: true
      }
    ],
    tags: ['home', 'lighting', 'modern'],
    featured: false,
    inventory: {
      count: 25,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 5
    }
  },
  {
    name: 'Succulent Plant Set',
    slug: 'succulent-plant-set',
    description: 'Beautiful set of 6 assorted succulent plants in decorative pots.',
    price: 39.99,
    category: 'home-garden',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&h=500&fit=crop&crop=center',
        alt: 'Succulent Plant Set',
        isPrimary: true
      }
    ],
    tags: ['home', 'plants', 'decor'],
    featured: false,
    inventory: {
      count: 35,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 5
    }
  },
  {
    name: 'Smart Home Security Camera',
    slug: 'smart-security-camera',
    description: '4K wireless security camera with night vision and AI detection',
    price: 199.99,
    category: 'home-garden',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        alt: 'Smart security camera',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=500',
        alt: 'Security camera installation',
        isPrimary: false
      }
    ],
    inventory: {
      count: 40,
      trackInventory: true,
      allowBackorder: true,
      lowStockThreshold: 5
    },
    featured: true,
    tags: ['security', 'camera', 'smart-home', 'surveillance']
  },
  {
    name: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    description: 'Comfortable office chair with lumbar support and adjustable height',
    price: 299.99,
    category: 'home-garden',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        alt: 'Ergonomic office chair',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500',
        alt: 'Office chair side view',
        isPrimary: false
      }
    ],
    inventory: {
      count: 25,
      trackInventory: true,
      allowBackorder: false,
      lowStockThreshold: 3
    },
    featured: false,
    tags: ['furniture', 'office', 'chair', 'ergonomic']
  },
  
  // Sports
  {
    name: 'Professional Running Shoes',
    slug: 'professional-running-shoes',
    description: 'High-performance running shoes with advanced cushioning',
    price: 149.99,
    category: 'sports',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        alt: 'Professional running shoes',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500',
        alt: 'Running shoes detail',
        isPrimary: false
      }
    ],
    inventory: {
      count: 80,
      trackInventory: true,
      allowBackorder: true,
      lowStockThreshold: 12
    },
    featured: true,
    tags: ['shoes', 'running', 'sports', 'athletic']
  },
  {
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description: 'Non-slip yoga mat with extra cushioning for comfort',
    price: 49.99,
    category: 'sports',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
        alt: 'Premium yoga mat',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?w=500',
        alt: 'Yoga mat in use',
        isPrimary: false
      }
    ],
    inventory: {
      count: 90,
      trackInventory: true,
      allowBackorder: true,
      lowStockThreshold: 15
    },
    featured: false,
    tags: ['yoga', 'fitness', 'mat', 'exercise']
  }
];

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed database...');
    
    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing data');
    
    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);
    
    // Map category names to IDs
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });
    
    // Update products with category references
    const productsWithCategoryIds = products.map(product => {
      const categoryDoc = createdCategories.find(cat => cat.slug === product.category);
      return {
        ...product,
        category: {
          id: categoryDoc._id,
          name: categoryDoc.name,
          slug: categoryDoc.slug
        }
      };
    });
    
    // Create products
    const createdProducts = await Product.insertMany(productsWithCategoryIds);
    console.log(`✅ Created ${createdProducts.length} products`);
    
    // Create admin user (check if exists first)
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (!existingAdmin) {
      const adminUser = new User({
        email: 'admin@example.com',
        password: 'admin123', // Pre-save hook will hash this
        role: 'admin',
        isEmailVerified: true,
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+1234567890'
        },
        preferences: {
          currency: 'USD',
          language: 'en',
          newsletter: true,
          smsNotifications: false,
          emailNotifications: {
            orderUpdates: true,
            promotions: false,
            productRecommendations: false
          }
        },
        addresses: []
      });
      
      await adminUser.save();
      console.log('✅ Created admin user (email: admin@example.com, password: admin123)');
    } else {
      console.log('✅ Admin user already exists (email: admin@example.com, password: admin123)');
    }
    
    console.log('🎉 Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = seedData;
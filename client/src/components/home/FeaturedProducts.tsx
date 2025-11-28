'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ui/ProductCard';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types';
import toast from 'react-hot-toast';

// Sample featured products data
const createProduct = (data: any): Product => ({
  ...data,
  tags: data.tags || [],
  variants: [],
  inventory: { 
    count: data.stock, 
    trackInventory: true, 
    allowBackorder: false, 
    lowStockThreshold: 5 
  },
  seo: { keywords: data.tags || [] },
  isActive: true,
  featured: data.isFeatured,
  primaryImage: data.images[0],
  isAvailable: data.stock > 0,
  stockStatus: data.stock > 10 ? 'in_stock' as const : data.stock > 0 ? 'low_stock' as const : 'out_of_stock' as const,
});

const featuredProducts: Product[] = [
  createProduct({
    id: '1',
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    description: 'High-quality wireless headphones with noise cancellation.',
    price: 299.99,
    compareAtPrice: 399.99,
    sku: 'WH-001',
    stock: 15,
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&crop=center', alt: 'Premium Wireless Headphones', isPrimary: true }],
    tags: ['electronics', 'headphones'],
    rating: 4.8,
    reviewCount: 124,
    isNew: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  createProduct({
    id: '2',
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    description: 'Advanced fitness tracking with heart rate monitoring.',
    price: 199.99,
    sku: 'SW-002',
    stock: 8,
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&crop=center', alt: 'Smart Fitness Watch', isPrimary: true }],
    tags: ['electronics', 'fitness'],
    rating: 4.6,
    reviewCount: 89,
    isNew: false,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  createProduct({
    id: '3',
    name: 'Minimalist Desk Lamp',
    slug: 'minimalist-desk-lamp',
    description: 'Modern LED desk lamp with adjustable brightness.',
    price: 89.99,
    compareAtPrice: 119.99,
    sku: 'DL-003',
    stock: 25,
    category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
    images: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=center', alt: 'Minimalist Desk Lamp', isPrimary: true }],
    tags: ['home', 'lighting'],
    rating: 4.9,
    reviewCount: 67,
    isNew: false,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  createProduct({
    id: '4',
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-tshirt',
    description: 'Comfortable organic cotton t-shirt in various colors.',
    price: 29.99,
    sku: 'TS-004',
    stock: 50,
    category: { id: '2', name: 'Fashion', slug: 'fashion' },
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&crop=center', alt: 'Organic Cotton T-Shirt', isPrimary: true }],
    tags: ['fashion', 'organic'],
    rating: 4.7,
    reviewCount: 156,
    isNew: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  createProduct({
    id: '5',
    name: 'Leather Crossbody Bag',
    slug: 'leather-crossbody-bag',
    description: 'Elegant leather crossbody bag perfect for everyday use.',
    price: 129.99,
    compareAtPrice: 159.99,
    sku: 'LB-005',
    stock: 12,
    category: { id: '2', name: 'Fashion', slug: 'fashion' },
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&crop=center', alt: 'Leather Crossbody Bag', isPrimary: true }],
    tags: ['fashion', 'leather'],
    rating: 4.8,
    reviewCount: 143,
    isNew: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  createProduct({
    id: '6',
    name: 'Succulent Plant Set',
    slug: 'succulent-plant-set',
    description: 'Beautiful set of 6 assorted succulent plants.',
    price: 39.99,
    sku: 'PS-006',
    stock: 35,
    category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
    images: [{ url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&h=500&fit=crop&crop=center', alt: 'Succulent Plant Set', isPrimary: true }],
    tags: ['home', 'plants'],
    rating: 4.7,
    reviewCount: 92,
    isNew: false,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
];

export function FeaturedProducts() {
  const { addItem } = useCart();

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product.id, undefined, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-earth-dark mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-earth-olive max-w-2xl mx-auto">
            Handpicked products that represent the best of what we offer. 
            Quality, innovation, and style in every selection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard 
                product={product}
                onAddToCart={handleAddToCart}
              />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-earth-bronze text-white font-semibold rounded-md hover:bg-earth-caramel transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
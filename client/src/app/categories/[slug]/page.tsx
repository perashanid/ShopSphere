'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types';
import toast from 'react-hot-toast';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

// Category data mapping
const categoryData = {
  'electronics': {
    name: 'Electronics',
    description: 'Latest gadgets, smartphones, laptops, and electronic accessories for modern living.',
    slug: 'electronics'
  },
  'fashion': {
    name: 'Fashion',
    description: 'Trendy clothing, shoes, and accessories for men and women.',
    slug: 'fashion'
  },
  'home-garden': {
    name: 'Home & Garden',
    description: 'Beautiful home decor, furniture, and garden essentials.',
    slug: 'home-garden'
  },
  'sports': {
    name: 'Sports',
    description: 'Athletic gear, fitness equipment, and outdoor sports accessories.',
    slug: 'sports'
  }
};



export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const analytics = useAnalyticsContext();

  const category = categoryData[slug as keyof typeof categoryData];

  useEffect(() => {
    if (!category) {
      router.push('/404');
      return;
    }
    
    // Track category view
    analytics.trackCategoryView(slug, category.name);
    
    fetchCategoryProducts();
  }, [slug, category, router, analytics]);

  const fetchCategoryProducts = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch from API
      // const response = await api.get(`/products?category=${slug}`);
      // setProducts(response.data.data.products);
      
      // For now, use sample data
      setSampleProducts();
    } catch (error) {
      console.error('Failed to fetch category products:', error);
      setSampleProducts();
    } finally {
      setLoading(false);
    }
  };

  const setSampleProducts = () => {
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
      featured: data.isFeatured || false,
      isFeatured: data.isFeatured || false,
      primaryImage: data.images[0],
      isAvailable: data.stock > 0,
      stockStatus: data.stock > 10 ? 'in_stock' as const : data.stock > 0 ? 'low_stock' as const : 'out_of_stock' as const,
    });

    const allProducts: Product[] = [
      // Electronics products
      createProduct({
        id: '1',
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
        price: 299.99,
        compareAtPrice: 399.99,
        sku: 'WH-001',
        stock: 15,
        category: { id: '1', name: 'Electronics', slug: 'electronics' },
        images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&crop=center', alt: 'Premium Wireless Headphones', isPrimary: true }],
        tags: ['electronics', 'headphones', 'wireless'],
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
        description: 'Advanced fitness tracking with heart rate monitoring and GPS.',
        price: 199.99,
        sku: 'SW-002',
        stock: 8,
        category: { id: '1', name: 'Electronics', slug: 'electronics' },
        images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&crop=center', alt: 'Smart Fitness Watch', isPrimary: true }],
        tags: ['electronics', 'fitness', 'watch'],
        rating: 4.6,
        reviewCount: 89,
        isNew: false,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      // Fashion products
      createProduct({
        id: '4',
        name: 'Organic Cotton T-Shirt',
        slug: 'organic-cotton-tshirt',
        description: 'Comfortable organic cotton t-shirt in various colors and sizes.',
        price: 29.99,
        sku: 'TS-004',
        stock: 50,
        category: { id: '2', name: 'Fashion', slug: 'fashion' },
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&crop=center', alt: 'Organic Cotton T-Shirt', isPrimary: true }],
        tags: ['fashion', 'organic', 'cotton'],
        rating: 4.7,
        reviewCount: 156,
        isNew: true,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      createProduct({
        id: '8',
        name: 'Leather Crossbody Bag',
        slug: 'leather-crossbody-bag',
        description: 'Elegant leather crossbody bag perfect for everyday use and special occasions.',
        price: 129.99,
        compareAtPrice: 159.99,
        sku: 'LB-008',
        stock: 12,
        category: { id: '2', name: 'Fashion', slug: 'fashion' },
        images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&crop=center', alt: 'Leather Crossbody Bag', isPrimary: true }],
        tags: ['fashion', 'leather', 'bag'],
        rating: 4.8,
        reviewCount: 143,
        isNew: true,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      // Home & Garden products
      createProduct({
        id: '3',
        name: 'Minimalist Desk Lamp',
        slug: 'minimalist-desk-lamp',
        description: 'Modern LED desk lamp with adjustable brightness and sleek design.',
        price: 89.99,
        compareAtPrice: 119.99,
        sku: 'DL-003',
        stock: 25,
        category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
        images: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=center', alt: 'Minimalist Desk Lamp', isPrimary: true }],
        tags: ['home', 'lighting', 'modern'],
        rating: 4.9,
        reviewCount: 67,
        isNew: false,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      createProduct({
        id: '9',
        name: 'Succulent Plant Set',
        slug: 'succulent-plant-set',
        description: 'Beautiful set of 6 assorted succulent plants in decorative pots.',
        price: 39.99,
        sku: 'PS-009',
        stock: 35,
        category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
        images: [{ url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&h=500&fit=crop&crop=center', alt: 'Succulent Plant Set', isPrimary: true }],
        tags: ['home', 'plants', 'decor'],
        rating: 4.7,
        reviewCount: 92,
        isNew: false,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      // Sports products
      createProduct({
        id: '12',
        name: 'Yoga Mat Premium',
        slug: 'yoga-mat-premium',
        description: 'Non-slip premium yoga mat with alignment lines and carrying strap.',
        price: 59.99,
        sku: 'YM-012',
        stock: 22,
        category: { id: '4', name: 'Sports & Fitness', slug: 'sports' },
        images: [{ url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop&crop=center', alt: 'Yoga Mat Premium', isPrimary: true }],
        tags: ['fitness', 'yoga', 'exercise'],
        rating: 4.5,
        reviewCount: 76,
        isNew: false,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    ];

    // Filter products by category
    const categoryProducts = allProducts.filter(product => 
      product.category.slug === slug
    );

    setProducts(categoryProducts);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product.id, undefined, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  if (!category) {
    return null; // Will redirect to 404
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-earth-sage/30 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card-modern p-4">
                  <div className="aspect-square bg-earth-light/40 rounded mb-4"></div>
                  <div className="h-4 bg-earth-sage/30 rounded mb-2"></div>
                  <div className="h-4 bg-earth-sage/30 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-earth-olive mb-8">
          <button onClick={() => router.push('/')} className="hover:text-earth-dark transition-colors">
            Home
          </button>
          <span>/</span>
          <button onClick={() => router.push('/categories')} className="hover:text-earth-dark transition-colors">
            Categories
          </button>
          <span>/</span>
          <span className="text-earth-dark">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-earth-olive hover:text-earth-dark transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-earth-dark mb-4">{category.name}</h1>
          <p className="text-lg text-earth-olive max-w-2xl">
            {category.description}
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-earth-sage mx-auto mb-4" />
            <p className="text-earth-olive text-lg">No products found in this category</p>
            <p className="text-earth-sage text-sm mt-2">Check back later for new products</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-earth-olive">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
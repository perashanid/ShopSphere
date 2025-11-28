'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Heart, Share2, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Product } from '@/types';
import toast from 'react-hot-toast';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import { usePageTracking } from '@/hooks/usePageTracking';



// Sample product data
const getSampleProductBySlug = (slug: string): Product | null => {
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

  const sampleProducts: Product[] = [
    createProduct({
      id: '1',
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      description: 'High-quality wireless headphones with noise cancellation and premium sound quality. These headphones feature advanced Bluetooth 5.0 connectivity, 30-hour battery life, and premium leather ear cushions for maximum comfort during extended listening sessions.',
      price: 299.99,
      compareAtPrice: 399.99,
      sku: 'WH-001',
      stock: 15,
      category: { id: '1', name: 'Electronics', slug: 'electronics' },
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&crop=center', alt: 'Premium Wireless Headphones', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&crop=center', alt: 'Headphones Side View', isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&crop=center', alt: 'Headphones Detail', isPrimary: false }
      ],
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
      description: 'Advanced fitness tracking with heart rate monitoring and GPS. Track your workouts, monitor your health metrics, and stay connected with smart notifications. Water-resistant design perfect for swimming and outdoor activities.',
      price: 199.99,
      sku: 'SW-002',
      stock: 8,
      category: { id: '1', name: 'Electronics', slug: 'electronics' },
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&crop=center', alt: 'Smart Fitness Watch', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=800&fit=crop&crop=center', alt: 'Watch Display', isPrimary: false }
      ],
      tags: ['electronics', 'fitness', 'watch'],
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
      description: 'Modern LED desk lamp with adjustable brightness and sleek design. Features touch controls, multiple lighting modes, and energy-efficient LED technology. Perfect for home office, study, or bedside use.',
      price: 89.99,
      compareAtPrice: 119.99,
      sku: 'DL-003',
      stock: 25,
      category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
      images: [
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=center', alt: 'Minimalist Desk Lamp', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=800&fit=crop&crop=center', alt: 'Lamp in Use', isPrimary: false }
      ],
      tags: ['home', 'lighting', 'modern'],
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
      description: 'Comfortable organic cotton t-shirt in various colors and sizes. Made from 100% certified organic cotton with a soft, breathable fabric that gets better with every wash. Available in multiple colors and sizes.',
      price: 29.99,
      sku: 'TS-004',
      stock: 50,
      category: { id: '2', name: 'Fashion', slug: 'fashion' },
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center', alt: 'Organic Cotton T-Shirt', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop&crop=center', alt: 'T-Shirt Detail', isPrimary: false }
      ],
      tags: ['fashion', 'organic', 'cotton'],
      rating: 4.7,
      reviewCount: 156,
      isNew: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    createProduct({
      id: '5',
      name: 'Bluetooth Speaker',
      slug: 'bluetooth-speaker',
      description: 'Portable Bluetooth speaker with excellent sound quality and long battery life. Features 360-degree sound, waterproof design, and up to 12 hours of continuous playback. Perfect for outdoor adventures and home entertainment.',
      price: 79.99,
      sku: 'BS-005',
      stock: 12,
      category: { id: '1', name: 'Electronics', slug: 'electronics' },
      images: [
        { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop&crop=center', alt: 'Bluetooth Speaker', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=800&fit=crop&crop=center', alt: 'Speaker in Action', isPrimary: false }
      ],
      tags: ['electronics', 'speaker', 'bluetooth'],
      rating: 4.5,
      reviewCount: 203,
      isNew: false,
      isFeatured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    createProduct({
      id: '8',
      name: 'Leather Crossbody Bag',
      slug: 'leather-crossbody-bag',
      description: 'Elegant leather crossbody bag perfect for everyday use and special occasions. Crafted from genuine leather with multiple compartments, adjustable strap, and timeless design that complements any outfit.',
      price: 129.99,
      compareAtPrice: 159.99,
      sku: 'LB-008',
      stock: 12,
      category: { id: '2', name: 'Fashion', slug: 'fashion' },
      images: [
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=center', alt: 'Leather Crossbody Bag', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop&crop=center', alt: 'Bag Detail', isPrimary: false }
      ],
      tags: ['fashion', 'leather', 'bag'],
      rating: 4.8,
      reviewCount: 143,
      isNew: true,
      isFeatured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  ];

  return sampleProducts.find(product => product.slug === slug) || null;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const analytics = useAnalyticsContext();
  
  // Track page time spent and interactions
  usePageTracking({
    pageName: product?.name || `Product: ${slug}`,
    trackScrollDepth: true,
    trackTimeSpent: true,
    trackInteractions: true
  });

  // Track product view and time spent
  useEffect(() => {
    if (product) {
      // Track product click/view
      analytics.trackProductClick?.(product.id, product.name);
      
      // Track time spent when component unmounts
      return () => {
        analytics.trackEvent?.({
          type: 'page_time',
          productId: product.id,
          metadata: {
            productName: product.name,
            timeSpent: Math.round((Date.now() - Date.now()) / 1000) // This will be handled by usePageTracking
          }
        });
      };
    }
  }, [product, analytics]);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${slug}`);
      const productData = response.data.data.product;
      setProduct(productData);
      
      // Set first variant as selected if variants exist
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0].id);
      }
    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      // Try to find product in sample data instead of showing 404
      const sampleProduct = getSampleProductBySlug(slug);
      if (sampleProduct) {
        setProduct(sampleProduct);
        if (sampleProduct.variants && sampleProduct.variants.length > 0) {
          setSelectedVariant(sampleProduct.variants[0].id);
        }
      } else {
        if (error.response?.status === 404) {
          router.push('/404');
        } else {
          toast.error('Failed to load product');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      router.push('/auth/login');
      return;
    }

    if (!product) return;

    // Track add to cart event
    analytics.trackAddToCart(product.id, product.name);

    try {
      await addToCart(product.id, selectedVariant || undefined, quantity);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (product && product.inventory.trackInventory && newQuantity > product.inventory.count) {
      toast.error('Not enough inventory available');
      return;
    }
    setQuantity(newQuantity);
  };

  const handleShare = async () => {
    if (!product) return;
    
    // Track share event
    analytics.trackEvent?.({
      type: 'share',
      productId: product.id,
      metadata: {
        productName: product.name
      }
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast.success('Product URL copied to clipboard');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product URL copied to clipboard');
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to wishlist');
      router.push('/auth/login');
      return;
    }
    
    if (!product) return;
    
    try {
      const productInWishlist = isInWishlist(product.id);
      
      if (productInWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      // Error is handled in the store
    }
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    
    if (selectedVariant) {
      const variant = product.variants?.find(v => v.id === selectedVariant);
      return variant?.price || product.price;
    }
    
    return product.price;
  };

  const getSelectedVariantData = () => {
    if (!product || !selectedVariant) return null;
    return product.variants?.find(v => v.id === selectedVariant);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const selectedVariantData = getSelectedVariantData();

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-earth-olive mb-8">
          <button onClick={() => router.push('/')} className="hover:text-earth-dark transition-colors">
            Home
          </button>
          <span>/</span>
          <button onClick={() => router.push('/products')} className="hover:text-earth-dark transition-colors">
            Products
          </button>
          <span>/</span>
          <span className="text-earth-dark">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
              {product.images && product.images.length > 0 && (
                <Image
                  src={product.images[selectedImageIndex]?.url}
                  alt={product.images[selectedImageIndex]?.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 relative ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-earth-dark mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? 'text-earth-bronze fill-current' : 'text-earth-sage/40'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-earth-olive">(4.0) • 24 reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-earth-bronze">
                  ${currentPrice.toFixed(2)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <span className="text-xl text-earth-sage line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
                {product.featured && (
                  <span className="bg-earth-bronze/20 text-earth-bronze px-2 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-earth-dark mb-2">Description</h3>
              <p className="text-earth-olive leading-relaxed">{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Options</h3>
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        selectedVariant === variant.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="variant"
                        value={variant.id}
                        checked={selectedVariant === variant.id}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{variant.name}</span>
                          <span className="text-gray-600">${variant.price?.toFixed(2) || product.price.toFixed(2)}</span>
                        </div>
                        {variant.attributes && variant.attributes.length > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            {variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={product.inventory.trackInventory && (quantity + 1) > product.inventory.count}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {product.inventory.trackInventory && (
                      <span>
                        {product.inventory.count > 0 
                          ? `${product.inventory.count} in stock`
                          : 'Out of stock'
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || !product.isAvailable}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {cartLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
                
                <button
                  onClick={toggleWishlist}
                  className={`p-3 border rounded-md transition-colors ${
                    isInWishlist(product.id)
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-earth-light/30 text-earth-olive hover:text-red-600 hover:border-red-300'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 border border-earth-light/30 text-earth-olive rounded-md hover:text-earth-dark transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over $50</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-600">SSL encrypted</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RotateCcw className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Easy Returns</p>
                    <p className="text-sm text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="card-modern p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
                Details
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Reviews (24)
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Shipping & Returns
              </button>
            </nav>
          </div>
          
          <div className="prose max-w-none">
            <h3>Product Details</h3>
            <p>{product.description}</p>
            
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <h4>Tags</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
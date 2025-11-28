'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Search, Filter, Grid, List, Package } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { useCart } from '@/hooks/useCart';
import api from '@/lib/api';
import { Product } from '@/types';
import toast from 'react-hot-toast';

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    featured: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const searchParams = useSearchParams();
  const { addItem } = useCart();

  // Initialize filters from URL parameters
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');

    if (categoryFromUrl) {
      setFilters(prev => ({ ...prev, category: categoryFromUrl }));
    }
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, sortBy, sortOrder, filters, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.featured && { featured: 'true' })
      });

      const response = await api.get(`/products?${params}`);
      const { products, pagination: paginationData } = response.data.data;

      setProducts(products);
      setPagination(prev => ({ ...prev, ...paginationData }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // For now, use sample data when API fails
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

    const sampleProducts: Product[] = [
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
        id: '5',
        name: 'Bluetooth Speaker',
        slug: 'bluetooth-speaker',
        description: 'Portable Bluetooth speaker with excellent sound quality and long battery life.',
        price: 79.99,
        sku: 'BS-005',
        stock: 12,
        category: { id: '1', name: 'Electronics', slug: 'electronics' },
        images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop&crop=center', alt: 'Bluetooth Speaker', isPrimary: true }],
        tags: ['electronics', 'speaker', 'bluetooth'],
        rating: 4.5,
        reviewCount: 203,
        isNew: false,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      createProduct({
        id: '6',
        name: 'Ceramic Coffee Mug Set',
        slug: 'ceramic-coffee-mug-set',
        description: 'Set of 4 handcrafted ceramic coffee mugs with unique earth-tone glazes.',
        price: 45.99,
        sku: 'CM-006',
        stock: 30,
        category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
        images: [{ url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500&h=500&fit=crop&crop=center', alt: 'Ceramic Coffee Mug Set', isPrimary: true }],
        tags: ['home', 'ceramic', 'coffee'],
        rating: 4.8,
        reviewCount: 92,
        isNew: true,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      createProduct({
        id: '7',
        name: 'Wireless Gaming Mouse',
        slug: 'wireless-gaming-mouse',
        description: 'High-precision wireless gaming mouse with RGB lighting and customizable buttons.',
        price: 89.99,
        sku: 'GM-007',
        stock: 18,
        category: { id: '1', name: 'Electronics', slug: 'electronics' },
        images: [{ url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop&crop=center', alt: 'Wireless Gaming Mouse', isPrimary: true }],
        tags: ['electronics', 'gaming', 'mouse'],
        rating: 4.6,
        reviewCount: 87,
        isNew: false,
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
      createProduct({
        id: '10',
        name: 'Vintage Sunglasses',
        slug: 'vintage-sunglasses',
        description: 'Classic vintage-style sunglasses with UV protection and polarized lenses.',
        price: 79.99,
        compareAtPrice: 99.99,
        sku: 'SG-010',
        stock: 28,
        category: { id: '2', name: 'Fashion', slug: 'fashion' },
        images: [{ url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop&crop=center', alt: 'Vintage Sunglasses', isPrimary: true }],
        tags: ['fashion', 'sunglasses', 'vintage'],
        rating: 4.4,
        reviewCount: 134,
        isNew: false,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      createProduct({
        id: '11',
        name: 'Essential Oil Diffuser',
        slug: 'essential-oil-diffuser',
        description: 'Ultrasonic essential oil diffuser with LED lights and timer settings.',
        price: 49.99,
        sku: 'ED-011',
        stock: 19,
        category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
        images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop&crop=center', alt: 'Essential Oil Diffuser', isPrimary: true }],
        tags: ['home', 'wellness', 'aromatherapy'],
        rating: 4.6,
        reviewCount: 108,
        isNew: true,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      createProduct({
        id: '12',
        name: 'Yoga Mat Premium',
        slug: 'yoga-mat-premium',
        description: 'Non-slip premium yoga mat with alignment lines and carrying strap.',
        price: 59.99,
        sku: 'YM-012',
        stock: 22,
        category: { id: '4', name: 'Sports & Fitness', slug: 'sports-fitness' },
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

    // Apply filters to sample products
    let filteredProducts = sampleProducts;

    // Filter by category
    if (filters.category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category.slug === filters.category
      );
    }

    // Filter by search term
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by price range
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= parseFloat(filters.maxPrice)
      );
    }

    // Filter by featured
    if (filters.featured) {
      filteredProducts = filteredProducts.filter(product =>
        product.featured || product.isFeatured
      );
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        case 'name':
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'createdAt':
        default:
          return sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setProducts(filteredProducts);
    setPagination(prev => ({
      ...prev,
      total: filteredProducts.length,
      pages: Math.ceil(filteredProducts.length / prev.limit)
    }));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product.id, undefined, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && products.length === 0) {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-earth-dark mb-4">Products</h1>

          {/* Search and Filters */}
          <div className="card-modern p-6 mb-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-sage h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-earth-light/30 rounded-md focus-elegant bg-white/80 backdrop-blur-sm text-earth-dark placeholder-earth-sage"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-earth-sage" />
                <span className="text-sm font-medium text-earth-olive">Filters:</span>
              </div>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-1 border border-earth-light/30 rounded text-sm bg-white/80 text-earth-dark focus-elegant"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home-garden">Home & Garden</option>
                <option value="sports">Sports</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="px-3 py-1 border border-earth-light/30 rounded text-sm w-24 bg-white/80 text-earth-dark focus-elegant"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="px-3 py-1 border border-earth-light/30 rounded text-sm w-24 bg-white/80 text-earth-dark focus-elegant"
              />

              <label className="flex items-center gap-2 text-sm text-earth-olive">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="rounded border-earth-light/30 text-earth-bronze focus:ring-earth-bronze/20"
                />
                Featured Only
              </label>
            </div>
          </div>

          {/* Sort and View Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-earth-light/30 rounded-md text-sm bg-white/80 text-earth-dark focus-elegant"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>

              <span className="text-sm text-earth-olive">
                {pagination.total} products found
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-earth-bronze/20 text-earth-bronze' : 'text-earth-sage hover:text-earth-olive'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-earth-bronze/20 text-earth-bronze' : 'text-earth-sage hover:text-earth-olive'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-earth-sage mx-auto mb-4" />
            <p className="text-earth-olive text-lg">No products found</p>
            <p className="text-earth-sage text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={`grid gap-6 mb-8 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
            }`}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-earth-light/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-earth-light/20 bg-white/80 text-earth-dark transition-colors"
            >
              Previous
            </button>

            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-md transition-colors ${pagination.page === page
                    ? 'bg-earth-bronze text-white border-earth-bronze'
                    : 'border-earth-light/30 hover:bg-earth-light/20 bg-white/80 text-earth-dark'
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-earth-light/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-earth-light/20 bg-white/80 text-earth-dark transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
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
    }>
      <ProductsPageContent />
    </Suspense>
  );
}


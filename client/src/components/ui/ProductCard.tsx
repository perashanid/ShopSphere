'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/utils/format';
import { Product } from '@/types';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ 
  product, 
  onAddToCart
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const analytics = useAnalyticsContext();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Track add to cart event
    analytics.trackAddToCart(product.id, product.name);
    
    if (onAddToCart) {
      setIsLoading(true);
      try {
        await onAddToCart(product);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to add to wishlist');
      return;
    }
    
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

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-earth-bronze fill-current'
            : 'text-earth-sage/40'
        }`}
      />
    ));
  };

  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="group card-modern hover-lift overflow-hidden">
      <div className="relative aspect-square bg-earth-light/30 overflow-hidden">
        <Link 
          href={`/products/${product.slug}`} 
          className="absolute inset-0 z-10"
          onClick={() => analytics.trackProductClick(product.id, product.name)}
        />
        {/* Product Image */}
        {product.images && product.images.length > 0 && !imageError ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-earth-sage/30 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <div className="w-10 h-10 bg-earth-bronze/40 rounded"></div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {product.isNew && (
            <span className="bg-earth-bronze text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
              New
            </span>
          )}
          {product.compareAtPrice && (
            <span className="bg-earth-caramel text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
              -{discountPercentage}%
            </span>
          )}
          {(product.isFeatured || product.featured) && (
            <span className="bg-earth-forest text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 z-20 ${
            isInWishlist(product.id) 
              ? 'bg-earth-bronze text-white' 
              : 'bg-white/80 text-earth-olive hover:bg-earth-bronze hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0 || !product.isAvailable}
            className="bg-earth-bronze text-white p-2 rounded-full hover:bg-earth-caramel transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Stock Status */}
        {(product.stock === 0 || !product.isAvailable) && (
          <div className="absolute inset-0 bg-earth-dark/60 flex items-center justify-center z-30">
            <span className="bg-earth-dark text-white px-3 py-1 rounded text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <Link 
        href={`/products/${product.slug}`}
        onClick={() => analytics.trackProductClick(product.id, product.name)}
      >
        <div className="p-4 hover:bg-earth-light/10 transition-colors">
          {/* Product Name */}
          <h3 className="font-semibold text-earth-dark mb-2 line-clamp-2 group-hover:text-earth-bronze transition-colors">
            {product.name}
          </h3>

          {/* Category */}
          {product.category && (
            <p className="text-sm text-earth-sage mb-2 capitalize">
              {typeof product.category === 'string' ? product.category : product.category.name}
            </p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-earth-olive">
                {product.rating} {product.reviewCount && `(${product.reviewCount})`}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-earth-dark text-lg">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-earth-sage line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between text-sm">
            <span className={`${
              product.stock > 10 
                ? 'text-earth-forest' 
                : product.stock > 0 
                  ? 'text-earth-bronze' 
                  : 'text-earth-sage'
            }`}>
              {product.stock > 10 
                ? 'In Stock' 
                : product.stock > 0 
                  ? `Only ${product.stock} left` 
                  : 'Out of Stock'
              }
            </span>
            
            {product.sku && (
              <span className="text-earth-sage text-xs">
                SKU: {product.sku}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
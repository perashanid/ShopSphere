// Utility functions for handling images

// Fallback image URLs that are more reliable
export const FALLBACK_IMAGES = {
  product: 'https://via.placeholder.com/500x500/8B4513/FFFFFF?text=Product+Image',
  category: 'https://via.placeholder.com/400x400/D2691E/FFFFFF?text=Category',
  user: 'https://via.placeholder.com/100x100/A0522D/FFFFFF?text=User',
  logo: 'https://via.placeholder.com/200x50/8B4513/FFFFFF?text=Logo'
};

// Function to handle image loading errors
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  if (img.src !== FALLBACK_IMAGES.product) {
    img.src = FALLBACK_IMAGES.product;
  }
};

// Function to get a reliable image URL
export const getReliableImageUrl = (originalUrl: string, type: 'product' | 'category' | 'user' = 'product') => {
  // If it's an Unsplash URL, try to make it more reliable
  if (originalUrl.includes('images.unsplash.com')) {
    // Add auto=format&fit=crop for better reliability
    const url = new URL(originalUrl);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }
  
  return originalUrl;
};

// Helper to create image props for reliable loading
export const getReliableImageProps = (
  src: string,
  alt: string,
  type: 'product' | 'category' | 'user' = 'product'
) => ({
  src: getReliableImageUrl(src, type),
  alt,
  onError: handleImageError,
  loading: 'lazy' as const
});
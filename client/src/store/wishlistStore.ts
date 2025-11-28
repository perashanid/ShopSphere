import { create } from 'zustand';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { trackEvent } from '@/utils/analytics';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: Array<{
      url: string;
      alt: string;
      isPrimary?: boolean;
    }>;
    primaryImage: {
      url: string;
      alt: string;
    } | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    isAvailable: boolean;
    stockStatus: string;
  };
  addedAt: string;
}

interface WishlistState {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  checkWishlistStatus: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  wishlistCount: 0,
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/wishlist');
      const { wishlist, count } = response.data.data;
      set({ 
        wishlist, 
        wishlistCount: count, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch wishlist:', error);
    }
  },

  addToWishlist: async (productId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/wishlist', { productId });
      const { wishlistCount } = response.data.data;
      
      // Refresh wishlist
      await get().fetchWishlist();
      
      set({ wishlistCount, isLoading: false });
      toast.success('Added to wishlist');
      
      // Track wishlist event
      try {
        await trackEvent({
          type: 'wishlist_add',
          productId,
          metadata: {
            wishlistCount
          }
        });
      } catch (analyticsError) {
        console.error('Failed to track wishlist event:', analyticsError);
      }
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error?.message || 'Failed to add to wishlist';
      toast.error(message);
      throw error;
    }
  },

  removeFromWishlist: async (productId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      const { wishlistCount } = response.data.data;
      
      // Update local state
      const currentWishlist = get().wishlist;
      const updatedWishlist = currentWishlist.filter(
        item => item.product.id !== productId
      );
      
      set({ 
        wishlist: updatedWishlist, 
        wishlistCount, 
        isLoading: false 
      });
      toast.success('Removed from wishlist');
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error?.message || 'Failed to remove from wishlist';
      toast.error(message);
      throw error;
    }
  },

  clearWishlist: async () => {
    set({ isLoading: true });
    try {
      await api.delete('/wishlist');
      set({ 
        wishlist: [], 
        wishlistCount: 0, 
        isLoading: false 
      });
      toast.success('Wishlist cleared');
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error?.message || 'Failed to clear wishlist';
      toast.error(message);
      throw error;
    }
  },

  checkWishlistStatus: async (productId: string) => {
    try {
      const response = await api.get(`/wishlist/check/${productId}`);
      return response.data.data.isInWishlist;
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
      return false;
    }
  },

  isInWishlist: (productId: string) => {
    const wishlist = get().wishlist;
    return wishlist.some(item => item.product.id === productId);
  },
}));
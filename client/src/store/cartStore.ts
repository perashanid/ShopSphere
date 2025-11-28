import { create } from 'zustand';
import { Cart, CartItem } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { trackEvent } from '@/utils/analytics';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cart');
      const cart = response.data.data.cart;
      
      // Filter out any items without valid product data
      if (cart && cart.items) {
        cart.items = cart.items.filter((item: any) => item.product && item.product.id);
      }
      
      set({ cart, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch cart:', error);
    }
  },

  addToCart: async (productId: string, variantId?: string, quantity = 1) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/cart/items', {
        productId,
        variantId,
        quantity,
      });
      const cart = response.data.data.cart;
      set({ cart, isLoading: false });
      toast.success('Item added to cart');
      
      // Track add to cart event
      try {
        await trackEvent({
          type: 'add_to_cart',
          productId,
          metadata: {
            quantity,
            variantId: variantId || null,
            cartItemCount: cart.itemCount
          }
        });
      } catch (analyticsError) {
        console.error('Failed to track add to cart event:', analyticsError);
      }
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error?.message || 'Failed to add item to cart';
      toast.error(message);
      throw error;
    }
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      const cart = response.data.data.cart;
      set({ cart, isLoading: false });
      toast.success('Cart updated');
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error?.message || 'Failed to update cart';
      toast.error(message);
      throw error;
    }
  },

  removeFromCart: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      const cart = response.data.data.cart;
      set({ cart, isLoading: false });
      toast.success('Item removed from cart');
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error?.message || 'Failed to remove item';
      toast.error(message);
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.delete('/cart');
      const cart = response.data.data.cart;
      set({ cart, isLoading: false });
      toast.success('Cart cleared');
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error?.message || 'Failed to clear cart';
      toast.error(message);
      throw error;
    }
  },

  applyCoupon: async (couponCode: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/cart/coupon', { couponCode });
      const cart = response.data.data.cart;
      set({ cart, isLoading: false });
      toast.success('Coupon applied successfully');
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error?.message || 'Failed to apply coupon';
      toast.error(message);
      throw error;
    }
  },

  removeCoupon: async () => {
    set({ isLoading: true });
    try {
      const response = await api.delete('/cart/coupon');
      const cart = response.data.data.cart;
      set({ cart, isLoading: false });
      toast.success('Coupon removed');
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.error?.message || 'Failed to remove coupon';
      toast.error(message);
      throw error;
    }
  },
}));
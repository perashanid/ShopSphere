import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export function useAppInitialization() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication status first
        await checkAuth();
      } catch (error) {
        console.error('Failed to check auth:', error);
      }
    };

    initializeApp();
  }, [checkAuth]);

  useEffect(() => {
    const initializeCart = async () => {
      if (isAuthenticated) {
        try {
          await fetchCart();
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      }
    };

    initializeCart();
  }, [isAuthenticated, fetchCart]);

  return { isAuthenticated };
}
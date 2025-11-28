import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, tokens } = response.data.data;

          // Store tokens
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Initialize wishlist after login
          const { useWishlistStore } = await import('./wishlistStore');
          useWishlistStore.getState().fetchWishlist().catch(console.error);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', userData);
          const { user, tokens } = response.data.data;

          // Store tokens
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Initialize wishlist after registration
          const { useWishlistStore } = await import('./wishlistStore');
          useWishlistStore.getState().fetchWishlist().catch(console.error);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Call logout endpoint
        api.post('/auth/logout').catch(() => {
          // Ignore errors on logout
        });

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await api.get('/auth/me');
          const user = response.data.data.user;

          set({
            user,
            isAuthenticated: true,
          });

          // Initialize wishlist after auth check
          const { useWishlistStore } = await import('./wishlistStore');
          useWishlistStore.getState().fetchWishlist().catch(console.error);
        } catch (error) {
          // If auth check fails, clear auth state
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      refreshUser: async () => {
        try {
          const response = await api.get('/auth/me');
          const user = response.data.data.user;

          set({ user });
        } catch (error) {
          // If refresh fails, logout
          get().logout();
          throw error;
        }
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
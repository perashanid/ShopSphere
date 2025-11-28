import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);
  const authHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    // Wait for auth store to hydrate
    if (authHydrated) {
      setIsHydrated(true);
    }
  }, [authHydrated]);

  // Fallback: set hydrated after a short delay if auth store doesn't hydrate
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return isHydrated;
}
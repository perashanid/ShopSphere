'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { shouldTrackAnalytics } from '@/utils/analytics';

interface AnalyticsContextType {
  trackProductClick: (productId: string, productName: string) => void;
  trackCategoryView: (categoryId: string, categoryName: string) => void;
  trackAddToCart: (productId: string, productName: string) => void;
  trackPurchase: (productId: string, productName: string, revenue?: number) => void;
  trackSearch: (searchQuery: string, resultsCount?: number) => void;
  trackFilter: (filterCriteria: any) => void;
  trackPageView: (pageName?: string) => void;
  trackEvent?: (event: any) => void;
  sessionId?: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const analytics = useAnalytics();
  const previousPathnameRef = useRef<string>('');
  const pageStartTimeRef = useRef<Date>(new Date());

  // Track page views when pathname changes
  useEffect(() => {
    if (!shouldTrackAnalytics()) return;

    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      // Track time spent on previous page
      if (previousPathnameRef.current && previousPathnameRef.current !== pathname) {
        analytics.trackTimeSpent();
      }

      // Track new page view
      analytics.trackPageView(pathname);
      previousPathnameRef.current = pathname;
      pageStartTimeRef.current = new Date();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, analytics]);

  // Track time spent when component unmounts or page unloads
  useEffect(() => {
    if (!shouldTrackAnalytics() || typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      analytics.trackTimeSpent();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Track time spent when component unmounts
      analytics.trackTimeSpent();
    };
  }, [analytics]);

  // Provide analytics functions to children
  const contextValue: AnalyticsContextType = {
    trackProductClick: analytics.trackProductClick,
    trackCategoryView: analytics.trackCategoryView,
    trackAddToCart: analytics.trackAddToCart,
    trackPurchase: analytics.trackPurchase,
    trackSearch: analytics.trackSearch,
    trackFilter: analytics.trackFilter,
    trackPageView: analytics.trackPageView,
    trackEvent: analytics.trackEvent,
    sessionId: analytics.sessionId
  };

  // Provide no-op functions if tracking is disabled or during SSR
  if (!shouldTrackAnalytics() || typeof window === 'undefined') {
    const noOpContextValue: AnalyticsContextType = {
      trackProductClick: () => {},
      trackCategoryView: () => {},
      trackAddToCart: () => {},
      trackPurchase: () => {},
      trackSearch: () => {},
      trackFilter: () => {},
      trackPageView: () => {},
      trackEvent: () => {},
      sessionId: undefined
    };
    
    return (
      <AnalyticsContext.Provider value={noOpContextValue}>
        {children}
      </AnalyticsContext.Provider>
    );
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};
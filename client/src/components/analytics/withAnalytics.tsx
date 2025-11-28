'use client';

import React, { useEffect, useRef } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

interface WithAnalyticsOptions {
  trackPageView?: boolean;
  pageName?: string;
  trackTimeSpent?: boolean;
  customTracking?: (analytics: ReturnType<typeof useAnalyticsContext>) => void;
}

export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAnalyticsOptions = {}
) {
  const {
    trackPageView = true,
    pageName,
    trackTimeSpent = true,
    customTracking
  } = options;

  const WithAnalyticsComponent: React.FC<P> = (props) => {
    const analytics = useAnalyticsContext();
    const mountTimeRef = useRef<Date>(new Date());
    const hasTrackedPageViewRef = useRef<boolean>(false);

    useEffect(() => {
      // Track page view on mount
      if (trackPageView && !hasTrackedPageViewRef.current) {
        analytics.trackPageView(pageName);
        hasTrackedPageViewRef.current = true;
      }

      // Custom tracking logic
      if (customTracking) {
        customTracking(analytics);
      }

      // Track time spent on unmount
      return () => {
        if (trackTimeSpent) {
          const timeSpent = Math.round((Date.now() - mountTimeRef.current.getTime()) / 1000);
          // Note: This would need to be implemented in the analytics context
          // analytics.trackTimeSpent(timeSpent);
        }
      };
    }, [analytics, customTracking, pageName, trackPageView, trackTimeSpent]);

    return <WrappedComponent {...props} />;
  };

  WithAnalyticsComponent.displayName = `withAnalytics(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithAnalyticsComponent;
}

// Convenience HOCs for common use cases
export const withPageTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName?: string
) => withAnalytics(WrappedComponent, { trackPageView: true, pageName });

export const withProductTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => withAnalytics(WrappedComponent, {
  customTracking: (analytics) => {
    // This would be used for product-specific tracking
    // Implementation depends on how product data is passed to the component
  }
});

export const withCategoryTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => withAnalytics(WrappedComponent, {
  customTracking: (analytics) => {
    // This would be used for category-specific tracking
    // Implementation depends on how category data is passed to the component
  }
});
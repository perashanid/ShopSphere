import { useEffect, useRef, useCallback } from 'react';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';

interface UsePageTrackingOptions {
  pageName?: string;
  trackScrollDepth?: boolean;
  trackTimeSpent?: boolean;
  trackInteractions?: boolean;
  scrollThresholds?: number[]; // Percentage thresholds to track
}

export const usePageTracking = (options: UsePageTrackingOptions = {}) => {
  const {
    pageName,
    trackScrollDepth = true,
    trackTimeSpent = true,
    trackInteractions = true,
    scrollThresholds = [25, 50, 75, 100]
  } = options;

  const analytics = useAnalyticsContext();
  const pageStartTimeRef = useRef<Date>(new Date());
  const maxScrollDepthRef = useRef<number>(0);
  const interactionCountRef = useRef<number>(0);
  const trackedScrollThresholdsRef = useRef<Set<number>>(new Set());
  const isTrackingRef = useRef<boolean>(false);

  // Reset tracking state when page changes
  useEffect(() => {
    pageStartTimeRef.current = new Date();
    maxScrollDepthRef.current = 0;
    interactionCountRef.current = 0;
    trackedScrollThresholdsRef.current.clear();
    isTrackingRef.current = true;

    return () => {
      isTrackingRef.current = false;
    };
  }, [pageName]);

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth) return;

    const handleScroll = () => {
      if (!isTrackingRef.current) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
      
      // Update max scroll depth
      if (scrollPercent > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = Math.min(scrollPercent, 100);
      }

      // Track scroll thresholds
      scrollThresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedScrollThresholdsRef.current.has(threshold)) {
          trackedScrollThresholdsRef.current.add(threshold);
          
          // Track scroll milestone
          analytics.trackEvent?.({
            type: 'page_time',
            metadata: {
              scrollDepth: threshold,
              pageName,
              milestone: `scroll_${threshold}%`
            }
          });
        }
      });
    };

    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [trackScrollDepth, scrollThresholds, analytics, pageName]);

  // Track user interactions
  useEffect(() => {
    if (!trackInteractions) return;

    const handleInteraction = () => {
      if (!isTrackingRef.current) return;
      interactionCountRef.current += 1;
    };

    const events = ['click', 'keydown', 'touchstart'];
    const throttledHandleInteraction = throttle(handleInteraction, 500);
    
    events.forEach(event => {
      document.addEventListener(event, throttledHandleInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandleInteraction);
      });
    };
  }, [trackInteractions]);

  // Track time spent when component unmounts or page changes
  useEffect(() => {
    return () => {
      if (trackTimeSpent && isTrackingRef.current) {
        const timeSpent = Math.round((Date.now() - pageStartTimeRef.current.getTime()) / 1000);
        
        analytics.trackEvent?.({
          type: 'page_time',
          metadata: {
            timeSpent,
            scrollDepth: maxScrollDepthRef.current,
            interactionCount: interactionCountRef.current,
            pageName
          }
        });
      }
    };
  }, [trackTimeSpent, analytics, pageName]);

  // Manual tracking functions
  const trackCustomEvent = useCallback((eventType: string, metadata?: Record<string, any>) => {
    if (!isTrackingRef.current) return;

    analytics.trackEvent?.({
      type: 'page_time', // Using page_time as base type for custom events
      metadata: {
        customEventType: eventType,
        pageName,
        timeSpent: Math.round((Date.now() - pageStartTimeRef.current.getTime()) / 1000),
        scrollDepth: maxScrollDepthRef.current,
        interactionCount: interactionCountRef.current,
        ...metadata
      }
    });
  }, [analytics, pageName]);

  const getCurrentMetrics = useCallback(() => {
    return {
      timeSpent: Math.round((Date.now() - pageStartTimeRef.current.getTime()) / 1000),
      scrollDepth: maxScrollDepthRef.current,
      interactionCount: interactionCountRef.current,
      trackedScrollThresholds: Array.from(trackedScrollThresholdsRef.current)
    };
  }, []);

  return {
    trackCustomEvent,
    getCurrentMetrics,
    isTracking: isTrackingRef.current
  };
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
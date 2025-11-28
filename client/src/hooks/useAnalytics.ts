import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

interface TrackEventData {
  type: 'product_click' | 'category_view' | 'page_time' | 'add_to_cart' | 
        'purchase' | 'wishlist_add' | 'share' | 'search' | 'filter_apply' |
        'checkout_start' | 'checkout_complete' | 'cart_abandon';
  productId?: string;
  categoryId?: string;
  metadata?: {
    productName?: string;
    categoryName?: string;
    timeSpent?: number;
    pageUrl?: string;
    referrer?: string;
    scrollDepth?: number;
    interactionCount?: number;
    searchQuery?: string;
    resultsCount?: number;
    revenue?: number;
    filterCriteria?: any;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    browserInfo?: {
      name: string;
      version: string;
    };
    screenResolution?: string;
    location?: {
      country?: string;
      city?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    trafficSource?: 'direct' | 'search' | 'social' | 'email' | 'referral' | 'paid';
    campaignData?: {
      source?: string;
      medium?: string;
      campaign?: string;
      term?: string;
      content?: string;
    };
  };
}

interface SessionInfo {
  sessionId: string;
  startTime: Date;
  pageViews: number;
  isReturningUser: boolean;
  deviceInfo: {
    userAgent: string;
    platform: string;
    isMobile: boolean;
  };
}

// Generate a unique session ID
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get device information
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return {
    userAgent,
    platform,
    isMobile
  };
};

// Get device type
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  const userAgent = navigator.userAgent;
  if (/iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|KFAPWI/i.test(userAgent)) {
    return 'tablet';
  }
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

// Get browser information
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
  }

  return { name: browserName, version: browserVersion };
};

// Get screen resolution
const getScreenResolution = (): string => {
  return `${screen.width}x${screen.height}`;
};

// Get traffic source from referrer and URL parameters
const getTrafficSource = (): { source: string; campaignData?: any } => {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  
  // Check for UTM parameters
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const utmTerm = urlParams.get('utm_term');
  const utmContent = urlParams.get('utm_content');
  
  if (utmSource) {
    return {
      source: 'paid',
      campaignData: {
        source: utmSource,
        medium: utmMedium,
        campaign: utmCampaign,
        term: utmTerm,
        content: utmContent
      }
    };
  }
  
  // Determine source from referrer
  if (!referrer) {
    return { source: 'direct' };
  }
  
  const referrerDomain = new URL(referrer).hostname.toLowerCase();
  
  if (referrerDomain.includes('google') || referrerDomain.includes('bing') || 
      referrerDomain.includes('yahoo') || referrerDomain.includes('duckduckgo')) {
    return { source: 'search' };
  }
  
  if (referrerDomain.includes('facebook') || referrerDomain.includes('twitter') || 
      referrerDomain.includes('instagram') || referrerDomain.includes('linkedin') ||
      referrerDomain.includes('tiktok') || referrerDomain.includes('youtube')) {
    return { source: 'social' };
  }
  
  if (referrerDomain.includes('gmail') || referrerDomain.includes('outlook') ||
      referrerDomain.includes('yahoo') || referrerDomain.includes('mail')) {
    return { source: 'email' };
  }
  
  return { source: 'referral' };
};

export const useAnalytics = () => {
  const { user } = useAuthStore();
  const sessionRef = useRef<SessionInfo | null>(null);
  const pageStartTimeRef = useRef<Date>(new Date());
  const interactionCountRef = useRef<number>(0);
  const scrollDepthRef = useRef<number>(0);
  const eventQueueRef = useRef<TrackEventData[]>([]);

  // Initialize session
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionRef.current) {
      if (typeof window === 'undefined') return;
      
      try {
        const existingSessionId = sessionStorage.getItem('analytics_session_id');
        const sessionStartTime = sessionStorage.getItem('analytics_session_start');
        
        if (existingSessionId && sessionStartTime) {
          // Continue existing session
          sessionRef.current = {
            sessionId: existingSessionId,
            startTime: new Date(sessionStartTime),
            pageViews: parseInt(sessionStorage.getItem('analytics_page_views') || '0'),
            isReturningUser: localStorage.getItem('analytics_returning_user') === 'true',
            deviceInfo: getDeviceInfo()
          };
        } else {
          // Create new session
          const sessionId = generateSessionId();
          const startTime = new Date();
          
          sessionRef.current = {
            sessionId,
            startTime,
            pageViews: 0,
            isReturningUser: localStorage.getItem('analytics_returning_user') === 'true',
            deviceInfo: getDeviceInfo()
          };
          
          sessionStorage.setItem('analytics_session_id', sessionId);
          sessionStorage.setItem('analytics_session_start', startTime.toISOString());
          localStorage.setItem('analytics_returning_user', 'true');
        }
      } catch (error) {
        console.error('Error initializing analytics session:', error);
      }
    }
  }, []);

  // Track scroll depth
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
      
      if (scrollPercent > scrollDepthRef.current) {
        scrollDepthRef.current = Math.min(scrollPercent, 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track interactions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleInteraction = () => {
      interactionCountRef.current += 1;
    };

    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  // Send queued events periodically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const sendQueuedEvents = async () => {
      if (eventQueueRef.current.length === 0) return;
      
      const events = [...eventQueueRef.current];
      eventQueueRef.current = [];
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await fetch(`${apiUrl}/analytics/batch-track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events,
            sessionInfo: sessionRef.current
          }),
        });
      } catch (error) {
        console.error('Failed to send analytics events:', error);
        // Re-queue events on failure
        eventQueueRef.current.unshift(...events);
      }
    };

    const interval = setInterval(sendQueuedEvents, 5000); // Send every 5 seconds
    
    // Send events before page unload
    const handleBeforeUnload = () => {
      if (eventQueueRef.current.length > 0 && navigator.sendBeacon) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        navigator.sendBeacon(`${apiUrl}/analytics/batch-track`, JSON.stringify({
          events: eventQueueRef.current,
          sessionInfo: sessionRef.current
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const trackEvent = useCallback(async (eventData: TrackEventData) => {
    if (!sessionRef.current) return;

    const trafficInfo = getTrafficSource();
    
    const enrichedEvent: TrackEventData = {
      ...eventData,
      metadata: {
        ...eventData.metadata,
        pageUrl: window.location.href,
        referrer: document.referrer,
        scrollDepth: scrollDepthRef.current,
        interactionCount: interactionCountRef.current,
        deviceType: getDeviceType(),
        browserInfo: getBrowserInfo(),
        screenResolution: getScreenResolution(),
        trafficSource: trafficInfo.source as any,
        campaignData: trafficInfo.campaignData,
      }
    };

    // Add to queue for batch sending
    eventQueueRef.current.push(enrichedEvent);
    
    // For critical events, send immediately
    if (['purchase', 'checkout_complete'].includes(eventData.type)) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await fetch(`${apiUrl}/analytics/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: enrichedEvent,
            sessionInfo: sessionRef.current
          }),
        });
      } catch (error) {
        console.error('Failed to send critical analytics event:', error);
      }
    }
  }, []);

  const trackPageView = useCallback((pageName?: string) => {
    if (!sessionRef.current) return;
    
    // Update page views
    sessionRef.current.pageViews += 1;
    sessionStorage.setItem('analytics_page_views', sessionRef.current.pageViews.toString());
    
    // Reset page-specific metrics
    pageStartTimeRef.current = new Date();
    interactionCountRef.current = 0;
    scrollDepthRef.current = 0;
    
    // Track page view event
    trackEvent({
      type: 'page_time',
      metadata: {
        productName: pageName,
        timeSpent: 0 // Will be updated when leaving page
      }
    });
  }, [trackEvent]);

  const trackTimeSpent = useCallback((productId?: string, productName?: string) => {
    const timeSpent = Math.round((Date.now() - pageStartTimeRef.current.getTime()) / 1000);
    
    trackEvent({
      type: 'page_time',
      productId,
      metadata: {
        productName,
        timeSpent,
        scrollDepth: scrollDepthRef.current,
        interactionCount: interactionCountRef.current
      }
    });
  }, [trackEvent]);

  const trackProductClick = useCallback((productId: string, productName: string) => {
    trackEvent({
      type: 'product_click',
      productId,
      metadata: {
        productName
      }
    });
  }, [trackEvent]);

  const trackCategoryView = useCallback((categoryId: string, categoryName: string) => {
    trackEvent({
      type: 'category_view',
      categoryId,
      metadata: {
        categoryName
      }
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((productId: string, productName: string) => {
    trackEvent({
      type: 'add_to_cart',
      productId,
      metadata: {
        productName
      }
    });
  }, [trackEvent]);

  const trackPurchase = useCallback((productId: string, productName: string, revenue?: number) => {
    trackEvent({
      type: 'purchase',
      productId,
      metadata: {
        productName,
        ...(revenue && { revenue })
      }
    });
  }, [trackEvent]);

  const trackSearch = useCallback((searchQuery: string, resultsCount?: number) => {
    trackEvent({
      type: 'search',
      metadata: {
        searchQuery,
        ...(resultsCount && { resultsCount })
      }
    });
  }, [trackEvent]);

  const trackFilter = useCallback((filterCriteria: any) => {
    trackEvent({
      type: 'filter_apply',
      metadata: {
        filterCriteria
      }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackTimeSpent,
    trackProductClick,
    trackCategoryView,
    trackAddToCart,
    trackPurchase,
    trackSearch,
    trackFilter,
    sessionId: sessionRef.current?.sessionId
  };
};
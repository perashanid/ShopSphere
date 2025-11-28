// Analytics utility functions

export interface AnalyticsEvent {
  type: 'product_click' | 'category_view' | 'page_time' | 'add_to_cart' | 
        'purchase' | 'wishlist_add' | 'share' | 'search' | 'filter_apply' |
        'checkout_start' | 'checkout_complete' | 'cart_abandon';
  productId?: string;
  categoryId?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface SessionData {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  isReturningUser: boolean;
  deviceInfo: {
    userAgent: string;
    platform: string;
    isMobile: boolean;
  };
}

// Generate unique session ID
export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${randomStr}`;
};

// Get device type from user agent
export const getDeviceType = (userAgent?: string): 'desktop' | 'mobile' | 'tablet' => {
  const ua = userAgent || navigator.userAgent;
  
  if (/iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|KFAPWI/i.test(ua)) {
    return 'tablet';
  }
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Parse browser information from user agent
export const getBrowserInfo = (userAgent?: string) => {
  const ua = userAgent || navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  const browsers = [
    { name: 'Chrome', regex: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', regex: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', regex: /Version\/([0-9.]+).*Safari/ },
    { name: 'Edge', regex: /Edge\/([0-9.]+)/ },
    { name: 'Opera', regex: /Opera\/([0-9.]+)/ },
    { name: 'Internet Explorer', regex: /MSIE ([0-9.]+)/ }
  ];

  for (const browser of browsers) {
    const match = ua.match(browser.regex);
    if (match) {
      browserName = browser.name;
      browserVersion = match[1];
      break;
    }
  }

  return { name: browserName, version: browserVersion };
};

// Get screen resolution
export const getScreenResolution = (): string => {
  if (typeof window !== 'undefined' && window.screen) {
    return `${screen.width}x${screen.height}`;
  }
  return 'unknown';
};

// Parse traffic source from referrer and URL parameters
export const getTrafficSource = (url?: string, referrer?: string) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const currentReferrer = referrer || (typeof document !== 'undefined' ? document.referrer : '');
  
  try {
    const urlObj = new URL(currentUrl);
    const urlParams = urlObj.searchParams;
    
    // Check for UTM parameters
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmTerm = urlParams.get('utm_term');
    const utmContent = urlParams.get('utm_content');
    
    if (utmSource) {
      return {
        source: 'paid' as const,
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
    if (!currentReferrer) {
      return { source: 'direct' as const };
    }
    
    const referrerDomain = new URL(currentReferrer).hostname.toLowerCase();
    
    // Search engines
    const searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'];
    if (searchEngines.some(engine => referrerDomain.includes(engine))) {
      return { source: 'search' as const };
    }
    
    // Social media
    const socialPlatforms = [
      'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 
      'youtube', 'pinterest', 'snapchat', 'reddit', 'tumblr'
    ];
    if (socialPlatforms.some(platform => referrerDomain.includes(platform))) {
      return { source: 'social' as const };
    }
    
    // Email
    const emailProviders = ['gmail', 'outlook', 'yahoo', 'mail', 'webmail'];
    if (emailProviders.some(provider => referrerDomain.includes(provider))) {
      return { source: 'email' as const };
    }
    
    return { source: 'referral' as const };
  } catch (error) {
    console.error('Error parsing traffic source:', error);
    return { source: 'direct' as const };
  }
};

// Calculate session duration
export const calculateSessionDuration = (startTime: Date, endTime?: Date): number => {
  const end = endTime || new Date();
  return Math.round((end.getTime() - startTime.getTime()) / 1000);
};

// Validate analytics event data
export const validateAnalyticsEvent = (event: AnalyticsEvent): boolean => {
  if (!event.type) return false;
  
  const validTypes = [
    'product_click', 'category_view', 'page_time', 'add_to_cart',
    'purchase', 'wishlist_add', 'share', 'search', 'filter_apply',
    'checkout_start', 'checkout_complete', 'cart_abandon'
  ];
  
  if (!validTypes.includes(event.type)) return false;
  
  // Type-specific validations
  if (['product_click', 'add_to_cart', 'purchase', 'wishlist_add'].includes(event.type)) {
    if (!event.productId) return false;
  }
  
  if (event.type === 'category_view' && !event.categoryId) {
    return false;
  }
  
  return true;
};

// Format analytics data for API
export const formatAnalyticsPayload = (
  events: AnalyticsEvent[],
  sessionData: SessionData,
  userId?: string
) => {
  return {
    userId,
    sessionId: sessionData.sessionId,
    events: events.map(event => ({
      ...event,
      timestamp: event.timestamp || new Date()
    })),
    sessionInfo: {
      ...sessionData,
      duration: sessionData.endTime 
        ? calculateSessionDuration(sessionData.startTime, sessionData.endTime)
        : calculateSessionDuration(sessionData.startTime)
    },
    userAgent: sessionData.deviceInfo.userAgent,
    ipAddress: null // Will be set by server
  };
};

// Debounce function for analytics events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for high-frequency events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Local storage helpers for analytics
export const AnalyticsStorage = {
  setSessionId: (sessionId: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
  },
  
  getSessionId: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('analytics_session_id');
    }
    return null;
  },
  
  setSessionStart: (startTime: Date) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('analytics_session_start', startTime.toISOString());
    }
  },
  
  getSessionStart: (): Date | null => {
    if (typeof window !== 'undefined') {
      const startTime = sessionStorage.getItem('analytics_session_start');
      return startTime ? new Date(startTime) : null;
    }
    return null;
  },
  
  setPageViews: (count: number) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('analytics_page_views', count.toString());
    }
  },
  
  getPageViews: (): number => {
    if (typeof window !== 'undefined') {
      return parseInt(sessionStorage.getItem('analytics_page_views') || '0');
    }
    return 0;
  },
  
  setReturningUser: (isReturning: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_returning_user', isReturning.toString());
    }
  },
  
  isReturningUser: (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('analytics_returning_user') === 'true';
    }
    return false;
  },
  
  clearSession: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('analytics_session_id');
      sessionStorage.removeItem('analytics_session_start');
      sessionStorage.removeItem('analytics_page_views');
    }
  }
};

// Error handling for analytics
export const handleAnalyticsError = (error: Error, context: string) => {
  console.error(`Analytics error in ${context}:`, error);
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
    // Example: Sentry.captureException(error, { tags: { context: 'analytics' } });
  }
};

// Check if analytics should be enabled (privacy compliance)
export const shouldTrackAnalytics = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for Do Not Track header
    if (navigator.doNotTrack === '1') return false;
    
    // Check for user consent (implement based on your privacy policy)
    const consent = localStorage.getItem('analytics_consent');
    if (consent === 'false') return false;
    
    // Default to true if no explicit denial
    return true;
  } catch (error) {
    // If there's any error accessing browser APIs, don't track
    return false;
  }
};

// Simple track event function for direct use
export const trackEvent = async (event: AnalyticsEvent): Promise<void> => {
  if (!shouldTrackAnalytics()) return;
  
  try {
    const api = (await import('@/lib/api')).default;
    
    const sessionId = AnalyticsStorage.getSessionId() || generateSessionId();
    const sessionStart = AnalyticsStorage.getSessionStart() || new Date();
    
    const sessionInfo = {
      sessionId,
      startTime: sessionStart,
      duration: calculateSessionDuration(sessionStart),
      pageViews: AnalyticsStorage.getPageViews(),
      isReturningUser: AnalyticsStorage.isReturningUser(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isMobile: getDeviceType() === 'mobile'
      }
    };
    
    await api.post('/analytics/track', {
      event,
      sessionInfo
    });
  } catch (error) {
    handleAnalyticsError(error as Error, 'trackEvent');
  }
};
// User types
export interface User {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  isEmailVerified: boolean;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    avatar?: string;
  };
  preferences: {
    currency: string;
    language: string;
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: {
      orderUpdates: boolean;
      promotions: boolean;
      productRecommendations: boolean;
    };
  };
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing' | 'both';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  variants: ProductVariant[];
  inventory: {
    count: number;
    trackInventory: boolean;
    allowBackorder: boolean;
    lowStockThreshold: number;
  };
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
  };
  isActive: boolean;
  featured: boolean;
  slug: string;
  primaryImage?: ProductImage;
  isAvailable: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';
  // Additional properties for UI components
  sku?: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  // Helper methods
  isInStock?: (quantity?: number) => boolean;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  sku: string;
  inventory: number;
  attributes: ProductAttribute[];
  isActive: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parent?: string;
  level: number;
  path: string;
  images: {
    banner?: CategoryImage;
    icon?: CategoryImage;
    thumbnail?: CategoryImage;
  };
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  showInNavigation: boolean;
  productCount: number;
  fullPath: string;
  breadcrumbs: Array<{ name: string; slug: string }>;
  seo?: {
    title?: string;
    description?: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CategoryImage {
  url: string;
  alt: string;
  type: 'banner' | 'icon' | 'thumbnail';
}

// Cart types
export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: ProductImage[];
    primaryImage?: ProductImage;
    isAvailable: boolean;
    stockStatus: string;
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    attributes: ProductAttribute[];
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount?: number;
    total: number;
  };
  itemCount: number;
  coupon?: {
    code: string;
    type: string;
    value: number;
    discount: number;
  };
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentInfo: {
    method: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
    transactionId?: string;
    paymentIntentId?: string;
    last4?: string;
    brand?: string;
    paidAt?: string;
    refundedAt?: string;
    refundAmount: number;
  };
  shippingInfo: {
    method: string;
    cost: number;
    estimatedDelivery?: {
      min: number;
      max: number;
    };
    trackingNumber?: string;
    carrier?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  totals: {
    subtotal: number;
    tax: number;
    taxRate: number;
    shipping: number;
    discount: number;
    total: number;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  notes: {
    customer?: string;
    internal?: string;
  };
  couponCode?: string;
  isGuestOrder: boolean;
  cancelledAt?: string;
  cancelReason?: string;
  totalItems: number;
  ageInDays: number;
  estimatedDeliveryDate?: string;
  statusDisplay: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: {
    id: string;
    name: string;
    slug: string;
    image: {
      url: string;
      alt: string;
    };
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    attributes: ProductAttribute[];
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: any[];
    code?: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: PaginationMeta;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CheckoutForm {
  shippingAddress: Omit<Address, 'id' | 'isDefault'>;
  billingAddress: Omit<Address, 'id' | 'isDefault'>;
  paymentMethod: string;
  shippingMethod: string;
  customerNotes?: string;
}

// Search and filter types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  tags?: string[];
}

export interface SearchSuggestion {
  type: 'product' | 'tag';
  text: string;
  slug?: string;
  count?: number;
}

// Payment types
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  fees: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  days: string;
  selected?: boolean;
}

// Analytics types
export interface AnalyticsEvent {
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
    [key: string]: any;
  };
  timestamp?: Date;
}

export interface UserInteraction {
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  action: 'click' | 'view' | 'add_to_cart' | 'purchase' | 'wishlist' | 'share';
  timestamp: Date;
  sessionId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
}

export interface CategoryView {
  userId: string;
  userName: string;
  categoryId: string;
  categoryName: string;
  timestamp: Date;
  timeSpent: number;
  bounceRate: number;
  conversionRate: number;
}

export interface TimeSpentData {
  userId: string;
  productId: string;
  productName: string;
  timeSpent: number;
  entryTime: Date;
  exitTime: Date;
  scrollDepth: number;
  interactionCount: number;
}

export interface ConversionMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  conversionRate: number;
  averageOrderValue: number;
  cartAbandonmentRate: number;
  checkoutCompletionRate: number;
  returnVisitorRate: number;
}

export interface UserBehaviorPattern {
  userId: string;
  sessionDuration: number;
  pagesViewed: number;
  productsViewed: number;
  categoriesExplored: number;
  searchQueries: string[];
  devicePreference: string;
  timeOfDayPreference: string;
  dayOfWeekPreference: string;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  views: number;
  clicks: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  averageTimeSpent: number;
  bounceRate: number;
  wishlistAdds: number;
  shares: number;
}

export interface TrafficSource {
  source: 'direct' | 'search' | 'social' | 'email' | 'referral' | 'paid';
  visitors: number;
  sessions: number;
  conversionRate: number;
  revenue: number;
  averageSessionDuration: number;
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  totalPageViews: number;
  totalRevenue: number;
  topProducts: ProductPerformance[];
  topCategories: CategoryView[];
  peakHours: { hour: number; activity: number }[];
  geographicDistribution: { country: string; users: number }[];
}

export interface AnalyticsData {
  userInteractions: UserInteraction[];
  categoryViews: CategoryView[];
  timeSpent: TimeSpentData[];
  conversionMetrics: ConversionMetrics;
  userBehaviorPatterns: UserBehaviorPattern[];
  productPerformance: ProductPerformance[];
  trafficSources: TrafficSource[];
  summary: AnalyticsSummary;
}
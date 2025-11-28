const { body, param, query } = require('express-validator');

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be between 1 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be between 1 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for password reset request
 */
const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

/**
 * Validation rules for password reset
 */
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Validation rules for email verification
 */
const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
];

/**
 * Validation rules for profile update
 */
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, other, prefer_not_to_say')
];

/**
 * Validation rules for address
 */
const validateAddress = [
  body('type')
    .optional()
    .isIn(['shipping', 'billing', 'both'])
    .withMessage('Address type must be one of: shipping, billing, both'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be between 1 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be between 1 and 50 characters'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  
  body('address1')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Address line 1 is required and must be between 1 and 100 characters'),
  
  body('address2')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Address line 2 cannot exceed 100 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City is required and must be between 1 and 50 characters'),
  
  body('state')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('State/Province is required and must be between 1 and 50 characters'),
  
  body('postalCode')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Postal code is required and must be between 1 and 20 characters'),
  
  body('country')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Country is required and must be between 1 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value')
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * Validation rules for user preferences
 */
const validatePreferences = [
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .isAlpha()
    .withMessage('Currency must be a 3-letter currency code'),
  
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be a valid language code'),
  
  body('newsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter preference must be a boolean value'),
  
  body('smsNotifications')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications preference must be a boolean value'),
  
  body('emailNotifications.orderUpdates')
    .optional()
    .isBoolean()
    .withMessage('Order updates preference must be a boolean value'),
  
  body('emailNotifications.promotions')
    .optional()
    .isBoolean()
    .withMessage('Promotions preference must be a boolean value'),
  
  body('emailNotifications.productRecommendations')
    .optional()
    .isBoolean()
    .withMessage('Product recommendations preference must be a boolean value')
];

/**
 * Validation rules for MongoDB ObjectId parameters
 */
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`)
];

/**
 * Validation rules for pagination
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'name', '-name'])
    .withMessage('Sort must be one of: createdAt, -createdAt, updatedAt, -updatedAt, name, -name')
];

/**
 * Validation rules for search
 */
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid ID'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('In stock filter must be a boolean value')
];

/**
 * Validation rules for product creation
 */
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name is required and must be between 1 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Product description is required and must be between 1 and 2000 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),
  
  body('category.id')
    .isMongoId()
    .withMessage('Category ID is required and must be valid'),
  
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one product image is required'),
  
  body('images.*.url')
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('images.*.alt')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Image alt text is required'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('inventory.count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Inventory count must be a non-negative integer'),
  
  body('inventory.trackInventory')
    .optional()
    .isBoolean()
    .withMessage('Track inventory must be a boolean value'),
  
  body('inventory.allowBackorder')
    .optional()
    .isBoolean()
    .withMessage('Allow backorder must be a boolean value'),
  
  body('inventory.lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean value')
];

/**
 * Validation rules for product update
 */
const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Product description must be between 1 and 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),
  
  body('category.id')
    .optional()
    .isMongoId()
    .withMessage('Category ID must be valid'),
  
  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one product image is required'),
  
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('images.*.alt')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Image alt text is required'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('inventory.count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Inventory count must be a non-negative integer'),
  
  body('inventory.trackInventory')
    .optional()
    .isBoolean()
    .withMessage('Track inventory must be a boolean value'),
  
  body('inventory.allowBackorder')
    .optional()
    .isBoolean()
    .withMessage('Allow backorder must be a boolean value'),
  
  body('inventory.lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean value')
];

/**
 * Validation rules for inventory update
 */
const validateInventoryUpdate = [
  body('count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Inventory count must be a non-negative integer'),
  
  body('trackInventory')
    .optional()
    .isBoolean()
    .withMessage('Track inventory must be a boolean value'),
  
  body('allowBackorder')
    .optional()
    .isBoolean()
    .withMessage('Allow backorder must be a boolean value'),
  
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer')
];

/**
 * Validation rules for inventory adjustment
 */
const validateInventoryAdjustment = [
  body('adjustment')
    .isInt()
    .withMessage('Adjustment must be an integer (positive to add, negative to subtract)'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters')
];

/**
 * Validation rules for adding item to cart
 */
const validateCartItem = [
  body('productId')
    .isMongoId()
    .withMessage('Product ID is required and must be valid'),
  
  body('variantId')
    .optional()
    .isMongoId()
    .withMessage('Variant ID must be valid'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99')
];

/**
 * Validation rules for updating cart item
 */
const validateCartItemUpdate = [
  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99')
];

/**
 * Validation rules for coupon
 */
const validateCoupon = [
  body('couponCode')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Coupon code is required and must be between 1 and 50 characters')
    .isAlphanumeric()
    .withMessage('Coupon code must contain only letters and numbers')
];

/**
 * Validation rules for order creation
 */
const validateOrder = [
  body('shippingAddress.firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Shipping address first name is required and must be between 1 and 50 characters'),
  
  body('shippingAddress.lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Shipping address last name is required and must be between 1 and 50 characters'),
  
  body('shippingAddress.address1')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Shipping address line 1 is required and must be between 1 and 100 characters'),
  
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Shipping address city is required and must be between 1 and 50 characters'),
  
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Shipping address state is required and must be between 1 and 50 characters'),
  
  body('shippingAddress.postalCode')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Shipping address postal code is required and must be between 1 and 20 characters'),
  
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Shipping address country is required and must be between 1 and 50 characters'),
  
  body('billingAddress.firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Billing address first name is required and must be between 1 and 50 characters'),
  
  body('billingAddress.lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Billing address last name is required and must be between 1 and 50 characters'),
  
  body('billingAddress.address1')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Billing address line 1 is required and must be between 1 and 100 characters'),
  
  body('billingAddress.city')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Billing address city is required and must be between 1 and 50 characters'),
  
  body('billingAddress.state')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Billing address state is required and must be between 1 and 50 characters'),
  
  body('billingAddress.postalCode')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Billing address postal code is required and must be between 1 and 20 characters'),
  
  body('billingAddress.country')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Billing address country is required and must be between 1 and 50 characters'),
  
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay'])
    .withMessage('Payment method must be one of: credit_card, debit_card, paypal, stripe, apple_pay, google_pay'),
  
  body('shippingMethod')
    .optional()
    .isIn(['standard', 'express', 'overnight'])
    .withMessage('Shipping method must be one of: standard, express, overnight'),
  
  body('customerNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Customer notes cannot exceed 1000 characters')
];

/**
 * Validation rules for order cancellation
 */
const validateOrderCancel = [
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Cancellation reason must be between 1 and 500 characters')
];

/**
 * Validation rules for checkout summary
 */
const validateCheckoutSummary = [
  body('shippingMethod')
    .optional()
    .isIn(['standard', 'express', 'overnight'])
    .withMessage('Shipping method must be one of: standard, express, overnight'),
  
  body('couponCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Coupon code must be between 1 and 50 characters')
    .isAlphanumeric()
    .withMessage('Coupon code must contain only letters and numbers')
];

/**
 * Validation rules for payment processing
 */
const validatePayment = [
  body('orderId')
    .isMongoId()
    .withMessage('Order ID is required and must be valid'),
  
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay'])
    .withMessage('Payment method must be one of: credit_card, debit_card, paypal, stripe, apple_pay, google_pay'),
  
  body('paymentToken')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Payment token must be between 1 and 500 characters'),
  
  body('cardDetails.number')
    .optional()
    .isLength({ min: 13, max: 19 })
    .withMessage('Card number must be between 13 and 19 digits')
    .isNumeric()
    .withMessage('Card number must contain only digits'),
  
  body('cardDetails.expiryMonth')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Expiry month must be between 1 and 12'),
  
  body('cardDetails.expiryYear')
    .optional()
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 })
    .withMessage('Expiry year must be valid'),
  
  body('cardDetails.cvv')
    .optional()
    .isLength({ min: 3, max: 4 })
    .withMessage('CVV must be 3 or 4 digits')
    .isNumeric()
    .withMessage('CVV must contain only digits'),
  
  body('cardDetails.holderName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Card holder name must be between 1 and 100 characters')
];

/**
 * Validation rules for payment refund
 */
const validateRefund = [
  body('orderId')
    .isMongoId()
    .withMessage('Order ID is required and must be valid'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be greater than 0'),
  
  body('reason')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Refund reason is required and must be between 1 and 500 characters')
];

/**
 * Validation rules for order status update
 */
const validateOrderStatusUpdate = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled, refunded'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Status note must be between 1 and 500 characters'),
  
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tracking number must be between 1 and 100 characters'),
  
  body('carrier')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Carrier must be between 1 and 50 characters')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateEmailVerification,
  validateProfileUpdate,
  validateAddress,
  validatePasswordChange,
  validatePreferences,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateProduct,
  validateProductUpdate,
  validateInventoryUpdate,
  validateInventoryAdjustment,
  validateCartItem,
  validateCartItemUpdate,
  validateCoupon,
  validateOrder,
  validateOrderCancel,
  validateCheckoutSummary,
  validatePayment,
  validateRefund,
  validateOrderStatusUpdate
};
import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Address validation schema
export const addressSchema = z.object({
  type: z.enum(['shipping', 'billing', 'both']).optional(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  company: z.string().max(100, 'Company name cannot exceed 100 characters').optional(),
  address1: z.string().min(1, 'Address line 1 is required').max(100, 'Address line 1 cannot exceed 100 characters'),
  address2: z.string().max(100, 'Address line 2 cannot exceed 100 characters').optional(),
  city: z.string().min(1, 'City is required').max(50, 'City cannot exceed 50 characters'),
  state: z.string().min(1, 'State/Province is required').max(50, 'State/Province cannot exceed 50 characters'),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code cannot exceed 20 characters'),
  country: z.string().min(1, 'Country is required').max(50, 'Country cannot exceed 50 characters'),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// Checkout validation schema
export const checkoutSchema = z.object({
  shippingAddress: addressSchema.omit({ isDefault: true }),
  billingAddress: addressSchema.omit({ isDefault: true }),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay']),
  shippingMethod: z.enum(['standard', 'express', 'overnight']).optional(),
  customerNotes: z.string().max(1000, 'Customer notes cannot exceed 1000 characters').optional(),
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject cannot exceed 200 characters'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters'),
});

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Review validation schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(1, 'Review title is required').max(100, 'Title cannot exceed 100 characters'),
  comment: z.string().min(1, 'Review comment is required').max(1000, 'Comment cannot exceed 1000 characters'),
});

// Search validation schema
export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query cannot exceed 100 characters'),
  category: z.string().optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().min(0, 'Maximum price cannot be negative').optional(),
  inStock: z.boolean().optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
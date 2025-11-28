const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');

// Import middleware
const { 
  authenticate, 
  verifyRefreshToken, 
  authRateLimit 
} = require('../middleware/auth');

const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateEmailVerification
} = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  validateRegister,
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  validateLogin,
  login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post('/refresh',
  verifyRefreshToken,
  refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke refresh tokens)
 * @access  Private
 */
router.post('/logout',
  authenticate,
  logout
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email address
 * @access  Public
 */
router.post('/verify-email',
  validateEmailVerification,
  verifyEmail
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-verification',
  authenticate,
  resendVerification
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password',
  authRateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  validateForgotPassword,
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password',
  validateResetPassword,
  resetPassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me',
  authenticate,
  getMe
);

module.exports = router;
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');
const config = require('../config/config');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'User with this email already exists'
        }
      });
    }
    
    // Create email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create new user
    const user = new User({
      email,
      password,
      profile: {
        firstName,
        lastName,
        phone
      },
      emailVerification: {
        token: emailVerificationToken,
        expires: emailVerificationExpires,
        verified: false
      }
    });
    
    await user.save();
    
    // Generate tokens
    const tokens = generateTokens(user);
    await user.save(); // Save refresh token
    
    // TODO: Send verification email
    // await sendVerificationEmail(user.email, emailVerificationToken);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens
      },
      message: 'User registered successfully. Please check your email to verify your account.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'User with this email already exists'
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error during registration'
      }
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    
    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password'
        }
      });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: {
          message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
        }
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account has been deactivated. Please contact support.'
        }
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Handle failed login attempt
      await user.handleFailedLogin();
      
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password'
        }
      });
    }
    
    // Handle successful login
    await user.handleSuccessfulLogin();
    
    // Generate tokens
    const tokens = generateTokens(user);
    await user.save(); // Save refresh token
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        },
        tokens
      },
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error during login'
      }
    });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
const refreshToken = async (req, res) => {
  try {
    // User and refresh token are set by verifyRefreshToken middleware
    const user = req.user;
    const oldRefreshToken = req.refreshToken;
    
    // Remove old refresh token
    await user.revokeRefreshToken(oldRefreshToken);
    
    // Generate new tokens
    const tokens = generateTokens(user);
    await user.save(); // Save new refresh token
    
    res.json({
      success: true,
      data: {
        tokens
      },
      message: 'Token refreshed successfully'
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error during token refresh'
      }
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Revoke specific refresh token
      await req.user.revokeRefreshToken(refreshToken);
    } else {
      // Revoke all refresh tokens
      await req.user.revokeAllRefreshTokens();
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error during logout'
      }
    });
  }
};

/**
 * Verify email address
 * @route POST /api/auth/verify-email
 * @access Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Verification token is required'
        }
      });
    }
    
    // Find user with matching verification token
    const user = await User.findOne({
      'emailVerification.token': token,
      'emailVerification.expires': { $gt: Date.now() },
      'emailVerification.verified': false
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired verification token'
        }
      });
    }
    
    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerification.verified = true;
    user.emailVerification.token = undefined;
    user.emailVerification.expires = undefined;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error during email verification'
      }
    });
  }
};

/**
 * Resend email verification
 * @route POST /api/auth/resend-verification
 * @access Private
 */
const resendVerification = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is already verified'
        }
      });
    }
    
    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    user.emailVerification = {
      token: emailVerificationToken,
      expires: emailVerificationExpires,
      verified: false
    };
    
    await user.save();
    
    // TODO: Send verification email
    // await sendVerificationEmail(user.email, emailVerificationToken);
    
    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while resending verification email'
      }
    });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    user.passwordReset = {
      token: resetToken,
      expires: resetExpires,
      used: false
    };
    
    await user.save();
    
    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while processing password reset request'
      }
    });
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }
    
    const { token, password } = req.body;
    
    // Find user with valid reset token
    const user = await User.findOne({
      'passwordReset.token': token,
      'passwordReset.expires': { $gt: Date.now() },
      'passwordReset.used': false
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired reset token'
        }
      });
    }
    
    // Update password
    user.password = password;
    user.passwordReset.used = true;
    user.passwordReset.token = undefined;
    user.passwordReset.expires = undefined;
    
    // Revoke all refresh tokens for security
    user.refreshTokens = [];
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while resetting password'
      }
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching user profile'
      }
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe
};
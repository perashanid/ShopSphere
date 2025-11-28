const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

/**
 * Middleware to authenticate JWT tokens
 * Extracts token from Authorization header and verifies it
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. No token provided or invalid format.'
        }
      });
    }
    
    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. No token provided.'
        }
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret, {
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client'
      });
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Token is valid but user not found.'
          }
        });
      }
      
      // Check if user account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Account has been deactivated.'
          }
        });
      }
      
      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          error: {
            message: 'Account is temporarily locked due to multiple failed login attempts.'
          }
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Token has expired.',
            code: 'TOKEN_EXPIRED'
          }
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid token.',
            code: 'INVALID_TOKEN'
          }
        });
      } else {
        throw jwtError;
      }
    }
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during authentication.'
      }
    });
  }
};

/**
 * Middleware to authorize specific roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required.'
        }
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Required role: ${roles.join(' or ')}`
        }
      });
    }
    
    next();
  };
};

/**
 * Middleware for optional authentication
 * Sets req.user if valid token is provided, but doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token provided, continue without authentication
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // No token provided, continue without authentication
    }
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret, {
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client'
      });
      
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
      
    } catch (jwtError) {
      // Token is invalid or expired, but we continue without authentication
      console.log('Optional auth - invalid token:', jwtError.message);
    }
    
    next();
    
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    next(); // Continue without authentication on error
  }
};

/**
 * Middleware to verify refresh token
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token is required.'
        }
      });
    }
    
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret, {
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client'
      });
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid token type.'
          }
        });
      }
      
      // Get user and check if refresh token exists
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not found.'
          }
        });
      }
      
      // Check if refresh token exists in user's token list
      const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
      
      if (!tokenExists) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Refresh token not found or has been revoked.'
          }
        });
      }
      
      // Check if user account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Account has been deactivated.'
          }
        });
      }
      
      req.user = user;
      req.refreshToken = refreshToken;
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Refresh token has expired.',
            code: 'REFRESH_TOKEN_EXPIRED'
          }
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid refresh token.',
            code: 'INVALID_REFRESH_TOKEN'
          }
        });
      } else {
        throw jwtError;
      }
    }
    
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error during refresh token verification.'
      }
    });
  }
};

/**
 * Middleware to check if user owns the resource
 * Compares req.user.id with req.params.userId or req.params.id
 */
const checkOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required.'
      }
    });
  }
  
  const resourceUserId = req.params.userId || req.params.id;
  
  if (!resourceUserId) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Resource user ID not found in request parameters.'
      }
    });
  }
  
  // Allow if user is admin or owns the resource
  if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: {
      message: 'Access denied. You can only access your own resources.'
    }
  });
};

/**
 * Middleware to rate limit authentication attempts
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries
    for (const [key, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(key);
      }
    }
    
    const clientAttempts = attempts.get(clientId);
    
    if (!clientAttempts) {
      attempts.set(clientId, {
        count: 1,
        firstAttempt: now
      });
      return next();
    }
    
    if (now - clientAttempts.firstAttempt > windowMs) {
      // Reset window
      attempts.set(clientId, {
        count: 1,
        firstAttempt: now
      });
      return next();
    }
    
    if (clientAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many authentication attempts. Please try again later.',
          retryAfter: Math.ceil((windowMs - (now - clientAttempts.firstAttempt)) / 1000)
        }
      });
    }
    
    clientAttempts.count++;
    next();
  };
};

/**
 * Utility function to generate tokens for a user
 */
const generateTokens = (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  
  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwtExpire
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  verifyRefreshToken,
  checkOwnership,
  authRateLimit,
  generateTokens
};
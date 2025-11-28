const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching profile'
      }
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
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
    
    const { firstName, lastName, phone, dateOfBirth, gender, avatar } = req.body;
    
    // Update profile fields
    if (firstName !== undefined) req.user.profile.firstName = firstName;
    if (lastName !== undefined) req.user.profile.lastName = lastName;
    if (phone !== undefined) req.user.profile.phone = phone;
    if (dateOfBirth !== undefined) req.user.profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) req.user.profile.gender = gender;
    if (avatar !== undefined) req.user.profile.avatar = avatar;
    
    await req.user.save();
    
    res.json({
      success: true,
      data: {
        user: req.user
      },
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while updating profile'
      }
    });
  }
};

/**
 * Change user password
 * @route PUT /api/users/password
 * @access Private
 */
const changePassword = async (req, res) => {
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
    
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password for comparison
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password is incorrect'
        }
      });
    }
    
    // Update password
    user.password = newPassword;
    
    // Revoke all refresh tokens for security
    user.refreshTokens = [];
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while changing password'
      }
    });
  }
};

/**
 * Update user preferences
 * @route PUT /api/users/preferences
 * @access Private
 */
const updatePreferences = async (req, res) => {
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
    
    const { 
      currency, 
      language, 
      newsletter, 
      smsNotifications, 
      emailNotifications 
    } = req.body;
    
    // Update preferences
    if (currency !== undefined) req.user.preferences.currency = currency;
    if (language !== undefined) req.user.preferences.language = language;
    if (newsletter !== undefined) req.user.preferences.newsletter = newsletter;
    if (smsNotifications !== undefined) req.user.preferences.smsNotifications = smsNotifications;
    
    // Update email notification preferences
    if (emailNotifications) {
      if (emailNotifications.orderUpdates !== undefined) {
        req.user.preferences.emailNotifications.orderUpdates = emailNotifications.orderUpdates;
      }
      if (emailNotifications.promotions !== undefined) {
        req.user.preferences.emailNotifications.promotions = emailNotifications.promotions;
      }
      if (emailNotifications.productRecommendations !== undefined) {
        req.user.preferences.emailNotifications.productRecommendations = emailNotifications.productRecommendations;
      }
    }
    
    await req.user.save();
    
    res.json({
      success: true,
      data: {
        preferences: req.user.preferences
      },
      message: 'Preferences updated successfully'
    });
    
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while updating preferences'
      }
    });
  }
};

/**
 * Get user addresses
 * @route GET /api/users/addresses
 * @access Private
 */
const getAddresses = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        addresses: req.user.addresses
      }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching addresses'
      }
    });
  }
};

/**
 * Add new address
 * @route POST /api/users/addresses
 * @access Private
 */
const addAddress = async (req, res) => {
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
    
    const addressData = req.body;
    
    // Add address using the model method
    await req.user.addAddress(addressData);
    
    res.status(201).json({
      success: true,
      data: {
        addresses: req.user.addresses
      },
      message: 'Address added successfully'
    });
    
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while adding address'
      }
    });
  }
};

/**
 * Update address
 * @route PUT /api/users/addresses/:addressId
 * @access Private
 */
const updateAddress = async (req, res) => {
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
    
    const { addressId } = req.params;
    const updateData = req.body;
    
    // Find the address
    const address = req.user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Address not found'
        }
      });
    }
    
    // Update address fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        address[key] = updateData[key];
      }
    });
    
    // If setting as default, remove default from other addresses of same type
    if (updateData.isDefault) {
      req.user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId && 
            (addr.type === address.type || addr.type === 'both' || address.type === 'both')) {
          addr.isDefault = false;
        }
      });
    }
    
    await req.user.save();
    
    res.json({
      success: true,
      data: {
        addresses: req.user.addresses
      },
      message: 'Address updated successfully'
    });
    
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while updating address'
      }
    });
  }
};

/**
 * Delete address
 * @route DELETE /api/users/addresses/:addressId
 * @access Private
 */
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    
    // Find and remove the address
    const address = req.user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Address not found'
        }
      });
    }
    
    // Remove the address
    req.user.addresses.pull(addressId);
    
    await req.user.save();
    
    res.json({
      success: true,
      data: {
        addresses: req.user.addresses
      },
      message: 'Address deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while deleting address'
      }
    });
  }
};

/**
 * Set default address
 * @route PUT /api/users/addresses/:addressId/default
 * @access Private
 */
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    
    // Find the address
    const address = req.user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Address not found'
        }
      });
    }
    
    // Remove default status from other addresses of same type
    req.user.addresses.forEach(addr => {
      if (addr.type === address.type || addr.type === 'both' || address.type === 'both') {
        addr.isDefault = addr._id.toString() === addressId;
      }
    });
    
    await req.user.save();
    
    res.json({
      success: true,
      data: {
        addresses: req.user.addresses
      },
      message: 'Default address updated successfully'
    });
    
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while setting default address'
      }
    });
  }
};

/**
 * Delete user account
 * @route DELETE /api/users/account
 * @access Private
 */
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password is required to delete account'
        }
      });
    }
    
    // Get user with password for verification
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Incorrect password'
        }
      });
    }
    
    // Instead of deleting, deactivate the account
    user.isActive = false;
    user.refreshTokens = [];
    await user.save();
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while deleting account'
      }
    });
  }
};

/**
 * Get user dashboard data
 * @route GET /api/users/dashboard
 * @access Private
 */
const getDashboard = async (req, res) => {
  try {
    // Get recent orders (this will be implemented when Order routes are created)
    // const recentOrders = await Order.find({ 'user.id': req.user._id })
    //   .sort({ createdAt: -1 })
    //   .limit(5);
    
    const dashboardData = {
      user: {
        id: req.user._id,
        email: req.user.email,
        profile: req.user.profile,
        isEmailVerified: req.user.isEmailVerified,
        memberSince: req.user.createdAt
      },
      stats: {
        totalOrders: 0, // Will be populated when orders are implemented
        totalSpent: 0,
        savedAddresses: req.user.addresses.length
      },
      recentOrders: [], // Will be populated when orders are implemented
      defaultAddresses: {
        shipping: req.user.defaultShippingAddress,
        billing: req.user.defaultBillingAddress
      }
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching dashboard data'
      }
    });
  }
};

/**
 * Get all users (Admin only)
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status
    } = req.query;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching users'
      }
    });
  }
};

/**
 * Get user by ID (Admin only)
 * @route GET /api/admin/users/:id
 * @access Private (Admin only)
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching user'
      }
    });
  }
};

/**
 * Update user (Admin only)
 * @route PUT /api/admin/users/:id
 * @access Private (Admin only)
 */
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow password updates through this endpoint
    delete updateData.password;
    delete updateData.refreshTokens;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user
      },
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while updating user'
      }
    });
  }
};

/**
 * Delete user (Admin only)
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 */
const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow admin to delete themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete your own account'
        }
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while deleting user'
      }
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updatePreferences,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  deleteAccount,
  getDashboard,
  // Admin functions
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
};
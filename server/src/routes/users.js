const express = require('express');
const router = express.Router();

// Import controllers
const {
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
  getDashboard
} = require('../controllers/userController');

// Import middleware
const { authenticate, checkOwnership } = require('../middleware/auth');
const {
  validateProfileUpdate,
  validatePasswordChange,
  validatePreferences,
  validateAddress,
  validateObjectId
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  validateProfileUpdate,
  updateProfile
);

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password',
  validatePasswordChange,
  changePassword
);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences',
  validatePreferences,
  updatePreferences
);

/**
 * @route   GET /api/users/addresses
 * @desc    Get user addresses
 * @access  Private
 */
router.get('/addresses', getAddresses);

/**
 * @route   POST /api/users/addresses
 * @desc    Add new address
 * @access  Private
 */
router.post('/addresses',
  validateAddress,
  addAddress
);

/**
 * @route   PUT /api/users/addresses/:addressId
 * @desc    Update address
 * @access  Private
 */
router.put('/addresses/:addressId',
  validateObjectId('addressId'),
  validateAddress,
  updateAddress
);

/**
 * @route   DELETE /api/users/addresses/:addressId
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:addressId',
  validateObjectId('addressId'),
  deleteAddress
);

/**
 * @route   PUT /api/users/addresses/:addressId/default
 * @desc    Set address as default
 * @access  Private
 */
router.put('/addresses/:addressId/default',
  validateObjectId('addressId'),
  setDefaultAddress
);

/**
 * @route   GET /api/users/dashboard
 * @desc    Get user dashboard data
 * @access  Private
 */
router.get('/dashboard', getDashboard);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete/deactivate user account
 * @access  Private
 */
router.delete('/account', deleteAccount);

module.exports = router;
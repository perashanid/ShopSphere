const express = require('express');
const router = express.Router();

// Import controllers
const {
  processPayment,
  getPaymentMethods,
  refundPayment
} = require('../controllers/paymentController');

// Import middleware
const { authenticate, authorize } = require('../middleware/auth');
const {
  validatePayment,
  validateRefund
} = require('../middleware/validation');

/**
 * @route   GET /api/payments/methods
 * @desc    Get available payment methods
 * @access  Private
 */
router.get('/methods',
  authenticate,
  getPaymentMethods
);

/**
 * @route   POST /api/payments/process
 * @desc    Process payment for an order
 * @access  Private
 */
router.post('/process',
  authenticate,
  validatePayment,
  processPayment
);

/**
 * @route   POST /api/payments/refund
 * @desc    Refund payment (Admin only)
 * @access  Private (Admin only)
 */
router.post('/refund',
  authenticate,
  authorize('admin'),
  validateRefund,
  refundPayment
);

module.exports = router;
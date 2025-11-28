const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const crypto = require('crypto');

/**
 * Process payment for an order
 * @route POST /api/payments/process
 * @access Private
 */
const processPayment = async (req, res) => {
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
      orderId,
      paymentMethod,
      paymentToken, // Token from payment gateway (Stripe, PayPal, etc.)
      cardDetails, // For demo purposes - in production, never store card details
      billingAddress
    } = req.body;

    // Get order
    const order = await Order.findOne({
      _id: orderId,
      'user.id': req.user._id,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found or cannot be processed'
        }
      });
    }

    // Update payment info
    order.paymentInfo.method = paymentMethod;
    order.paymentInfo.status = 'processing';

    // Simulate payment processing based on method
    let paymentResult;
    
    try {
      switch (paymentMethod) {
        case 'credit_card':
        case 'debit_card':
          paymentResult = await processCreditCardPayment(order, paymentToken, cardDetails);
          break;
        case 'paypal':
          paymentResult = await processPayPalPayment(order, paymentToken);
          break;
        case 'stripe':
          paymentResult = await processStripePayment(order, paymentToken);
          break;
        case 'apple_pay':
          paymentResult = await processApplePayPayment(order, paymentToken);
          break;
        case 'google_pay':
          paymentResult = await processGooglePayPayment(order, paymentToken);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      if (paymentResult.success) {
        // Payment successful
        order.paymentInfo.status = 'completed';
        order.paymentInfo.transactionId = paymentResult.transactionId;
        order.paymentInfo.paymentIntentId = paymentResult.paymentIntentId;
        order.paymentInfo.paidAt = new Date();
        
        if (paymentResult.cardInfo) {
          order.paymentInfo.last4 = paymentResult.cardInfo.last4;
          order.paymentInfo.brand = paymentResult.cardInfo.brand;
        }

        // Update order status
        order.status = 'confirmed';
        
        await order.save();

        res.json({
          success: true,
          data: {
            order,
            payment: {
              transactionId: paymentResult.transactionId,
              status: 'completed',
              amount: order.totals.total
            }
          },
          message: 'Payment processed successfully'
        });

      } else {
        // Payment failed
        order.paymentInfo.status = 'failed';
        await order.save();

        res.status(400).json({
          success: false,
          error: {
            message: paymentResult.error || 'Payment processing failed',
            code: 'PAYMENT_FAILED'
          }
        });
      }

    } catch (paymentError) {
      // Payment processing error
      order.paymentInfo.status = 'failed';
      await order.save();

      console.error('Payment processing error:', paymentError);
      res.status(500).json({
        success: false,
        error: {
          message: 'Payment processing failed',
          code: 'PAYMENT_ERROR'
        }
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while processing payment'
      }
    });
  }
};

/**
 * Get payment methods
 * @route GET /api/payments/methods
 * @access Private
 */
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        description: 'Visa, MasterCard, American Express',
        enabled: true,
        fees: 0
      },
      {
        id: 'debit_card',
        name: 'Debit Card',
        description: 'Visa Debit, MasterCard Debit',
        enabled: true,
        fees: 0
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        enabled: true,
        fees: 0
      },
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'Secure payment processing',
        enabled: true,
        fees: 0
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        description: 'Pay with Touch ID or Face ID',
        enabled: true,
        fees: 0
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        description: 'Pay with Google Pay',
        enabled: true,
        fees: 0
      }
    ];

    res.json({
      success: true,
      data: {
        paymentMethods
      }
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while fetching payment methods'
      }
    });
  }
};

/**
 * Refund payment
 * @route POST /api/payments/refund
 * @access Private (Admin only)
 */
const refundPayment = async (req, res) => {
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

    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found'
        }
      });
    }

    if (order.paymentInfo.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Order payment is not completed'
        }
      });
    }

    const refundAmount = amount || order.totals.total;
    const maxRefundAmount = order.totals.total - order.paymentInfo.refundAmount;

    if (refundAmount > maxRefundAmount) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Maximum refund amount is $${maxRefundAmount.toFixed(2)}`
        }
      });
    }

    // Process refund (simulate)
    const refundResult = await processRefund(order, refundAmount, reason);

    if (refundResult.success) {
      // Update order
      await order.processRefund(refundAmount, reason);

      res.json({
        success: true,
        data: {
          order,
          refund: {
            transactionId: refundResult.refundId,
            amount: refundAmount,
            reason
          }
        },
        message: 'Refund processed successfully'
      });

    } else {
      res.status(400).json({
        success: false,
        error: {
          message: refundResult.error || 'Refund processing failed'
        }
      });
    }

  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while processing refund'
      }
    });
  }
};

// Simulated payment processing functions
// In production, these would integrate with real payment gateways

async function processCreditCardPayment(order, paymentToken, cardDetails) {
  // Simulate credit card processing
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

  // Simulate random success/failure for demo
  const success = Math.random() > 0.1; // 90% success rate

  if (success) {
    return {
      success: true,
      transactionId: `cc_${crypto.randomBytes(8).toString('hex')}`,
      paymentIntentId: `pi_${crypto.randomBytes(12).toString('hex')}`,
      cardInfo: {
        last4: cardDetails?.number?.slice(-4) || '4242',
        brand: cardDetails?.brand || 'visa'
      }
    };
  } else {
    return {
      success: false,
      error: 'Card declined'
    };
  }
}

async function processPayPalPayment(order, paymentToken) {
  // Simulate PayPal processing
  await new Promise(resolve => setTimeout(resolve, 800));

  const success = Math.random() > 0.05; // 95% success rate

  if (success) {
    return {
      success: true,
      transactionId: `pp_${crypto.randomBytes(8).toString('hex')}`,
      paymentIntentId: `PAYID-${crypto.randomBytes(12).toString('hex').toUpperCase()}`
    };
  } else {
    return {
      success: false,
      error: 'PayPal payment failed'
    };
  }
}

async function processStripePayment(order, paymentToken) {
  // Simulate Stripe processing
  await new Promise(resolve => setTimeout(resolve, 600));

  const success = Math.random() > 0.03; // 97% success rate

  if (success) {
    return {
      success: true,
      transactionId: `ch_${crypto.randomBytes(12).toString('hex')}`,
      paymentIntentId: `pi_${crypto.randomBytes(12).toString('hex')}`
    };
  } else {
    return {
      success: false,
      error: 'Stripe payment failed'
    };
  }
}

async function processApplePayPayment(order, paymentToken) {
  // Simulate Apple Pay processing
  await new Promise(resolve => setTimeout(resolve, 500));

  const success = Math.random() > 0.02; // 98% success rate

  if (success) {
    return {
      success: true,
      transactionId: `ap_${crypto.randomBytes(8).toString('hex')}`,
      paymentIntentId: `applepay_${crypto.randomBytes(10).toString('hex')}`
    };
  } else {
    return {
      success: false,
      error: 'Apple Pay payment failed'
    };
  }
}

async function processGooglePayPayment(order, paymentToken) {
  // Simulate Google Pay processing
  await new Promise(resolve => setTimeout(resolve, 500));

  const success = Math.random() > 0.02; // 98% success rate

  if (success) {
    return {
      success: true,
      transactionId: `gp_${crypto.randomBytes(8).toString('hex')}`,
      paymentIntentId: `googlepay_${crypto.randomBytes(10).toString('hex')}`
    };
  } else {
    return {
      success: false,
      error: 'Google Pay payment failed'
    };
  }
}

async function processRefund(order, amount, reason) {
  // Simulate refund processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  const success = Math.random() > 0.05; // 95% success rate

  if (success) {
    return {
      success: true,
      refundId: `re_${crypto.randomBytes(8).toString('hex')}`
    };
  } else {
    return {
      success: false,
      error: 'Refund processing failed'
    };
  }
}

module.exports = {
  processPayment,
  getPaymentMethods,
  refundPayment
};
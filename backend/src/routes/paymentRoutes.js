const express = require('express');
const router = express.Router();
const {
  paystackWebhook,
  initiateMobileMoney,
  verifyMobileMoneyCharge,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Mobile Money (Paystack)
router.post('/mobile-money/initiate', protect, initiateMobileMoney);
router.get('/mobile-money/verify/:reference', protect, verifyMobileMoneyCharge);

// Paystack webhook (for payment confirmations)
router.post('/paystack/webhook', paystackWebhook);

module.exports = router;

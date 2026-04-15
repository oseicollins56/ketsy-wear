const Paystack = require('paystack');
const Order = require('../models/Order');

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

// @desc    Paystack webhook
// @route   POST /api/payment/paystack/webhook
exports.paystackWebhook = async (req, res) => {
  const hash = require('crypto')
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const orderId = event.data.metadata?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paidAt: Date.now(),
        status: 'processing',
        paymentResult: {
          provider: 'paystack',
          reference: event.data.reference,
          status: 'paid',
          transactionId: event.data.id.toString(),
          paidAt: new Date(),
        },
      });
    }
  }

  res.sendStatus(200);
};

// @desc    Initiate Mobile Money payment (via Paystack)
// @route   POST /api/payment/mobile-money/initiate
exports.initiateMobileMoney = async (req, res) => {
  const { orderId, phone, network } = req.body;
  const order = await Order.findById(orderId).populate('user', 'email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const networkCodes = { MTN: 'mtn', Vodafone: 'vod', AirtelTigo: 'atl' };

  const response = await paystack.charge.create({
    email: order.user.email,
    amount: Math.round(order.totalPrice * 100),
    currency: 'GHS',
    mobile_money: {
      phone,
      provider: networkCodes[network] || 'mtn',
    },
    metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
  });

  res.status(200).json({
    success: true,
    reference: response.data.reference,
    status: response.data.status,
    displayText: response.data.display_text,
  });
};

// @desc    Verify mobile money charge
// @route   GET /api/payment/mobile-money/verify/:reference
exports.verifyMobileMoneyCharge = async (req, res) => {
  const response = await paystack.charge.check(req.params.reference);

  if (response.data.status === 'success') {
    const orderId = response.data.metadata?.orderId;
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        isPaid: true,
        paidAt: Date.now(),
        status: 'processing',
        paymentResult: {
          provider: 'mobile-money',
          reference: req.params.reference,
          status: 'paid',
          transactionId: response.data.id.toString(),
          paidAt: new Date(),
        },
      },
      { new: true }
    );
    return res.status(200).json({ success: true, order });
  }

  res.status(200).json({ success: true, status: response.data.status });
};

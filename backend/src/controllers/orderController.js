const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { sendOrderConfirmation, sendShippingUpdate } = require('../utils/email');

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    mobileMoneyDetails,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items' });
  }

  // Calculate prices and validate stock
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    }

    const orderItem = {
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      image: product.images[0]?.url || '',
      size: item.size,
      color: item.color,
      customization: item.customization,
    };
    orderItems.push(orderItem);
    itemsPrice += orderItem.price * item.quantity;
  }

  const shippingPrice = itemsPrice > 200 ? 0 : 15; // Free shipping over GHS 200
  const taxPrice = Math.round(itemsPrice * 0.125 * 100) / 100; // 12.5% VAT
  let totalPrice = itemsPrice + shippingPrice + taxPrice;
  let discountAmount = 0;
  let appliedCoupon = null;

  // Apply coupon
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validity = coupon.isValid(totalPrice, req.user.id);
      if (validity.valid) {
        discountAmount = coupon.calculateDiscount(totalPrice);
        totalPrice -= discountAmount;
        appliedCoupon = coupon;
      }
    }
  }

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    mobileMoneyDetails,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice: Math.round(totalPrice * 100) / 100,
    discountAmount,
    couponCode: appliedCoupon ? couponCode : undefined,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Update product stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  // Update coupon usage
  if (appliedCoupon) {
    appliedCoupon.usedCount += 1;
    appliedCoupon.usedBy.push(req.user.id);
    await appliedCoupon.save();
  }

  // Send confirmation email
  try {
    await sendOrderConfirmation(order, req.user);
  } catch (err) {
    console.error('Error sending order email:', err.message);
  }

  res.status(201).json({ success: true, order });
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Ensure user owns the order or is admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, order });
};

// @desc    Get my orders
// @route   GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments({ user: req.user.id });
  const orders = await Order.find({ user: req.user.id })
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    orders,
  });
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.orderNumber = new RegExp(search, 'i');

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    orders,
  });
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  const { status, trackingNumber, trackingUrl, note } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  order.statusHistory.push({ status, note });

  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();

  // Send shipping notification
  if (status === 'shipped') {
    try {
      await sendShippingUpdate(order, order.user);
    } catch (err) {
      console.error('Error sending shipping email:', err.message);
    }
  }

  res.status(200).json({ success: true, order });
};

// @desc    Upload bank transfer proof
// @route   PUT /api/orders/:id/transfer-proof
exports.uploadTransferProof = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  order.bankTransferDetails = {
    ...req.body,
    proofOfPayment: req.body.proofUrl,
  };
  order.status = 'processing';
  order.statusHistory.push({ status: 'processing', note: 'Bank transfer proof uploaded' });
  await order.save();

  res.status(200).json({ success: true, order });
};

// @desc    Get sales analytics (admin)
// @route   GET /api/orders/analytics
exports.getAnalytics = async (req, res) => {
  const { period = 'monthly' } = req.query;
  const now = new Date();
  let startDate;

  if (period === 'daily') startDate = new Date(now.setDate(now.getDate() - 30));
  else if (period === 'weekly') startDate = new Date(now.setDate(now.getDate() - 84));
  else startDate = new Date(now.setFullYear(now.getFullYear() - 1));

  const groupFormat = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%U' : '%Y-%m';

  const salesData = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, isPaid: true } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });

  res.status(200).json({
    success: true,
    salesData,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalOrders,
    pendingOrders,
  });
};

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const upload = require('../middleware/upload');
const csv = require('csv-parser');
const { Readable } = require('stream');

const adminOnly = [protect, authorize('admin')];

// ===== USERS =====
router.get('/users', ...adminOnly, async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = {};
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort('-createdAt').skip(skip).limit(Number(limit));

  res.status(200).json({ success: true, total, users });
});

router.get('/users/:id', ...adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, user });
});

router.put('/users/:id/role', ...adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  res.status(200).json({ success: true, user });
});

// ===== COUPONS =====
router.get('/coupons', ...adminOnly, async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.status(200).json({ success: true, coupons });
});

router.post('/coupons', ...adminOnly, async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

router.put('/coupons/:id', ...adminOnly, async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, coupon });
});

router.delete('/coupons/:id', ...adminOnly, async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Coupon deleted' });
});

// ===== VALIDATE COUPON (user accessible) =====
router.post('/coupons/validate', protect, async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

  const validity = coupon.isValid(orderAmount, req.user.id);
  if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });

  const discountAmount = coupon.calculateDiscount(orderAmount);
  res.status(200).json({ success: true, discountAmount, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue } });
});

// ===== BULK PRODUCT UPLOAD =====
router.post('/products/bulk', ...adminOnly, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a CSV file' });

  const results = [];
  const errors = [];

  const stream = Readable.from(req.file.buffer.toString());
  stream
    .pipe(require('csv-parser')())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let created = 0;
      for (const row of results) {
        try {
          await Product.create({
            name: row.name,
            description: row.description,
            category: row.category,
            price: Number(row.price),
            stock: Number(row.stock) || 0,
          });
          created++;
        } catch (err) {
          errors.push({ row: row.name, error: err.message });
        }
      }
      res.status(200).json({ success: true, created, errors });
    });
});

// ===== STOCK ALERTS =====
router.get('/stock-alerts', ...adminOnly, async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    isActive: true,
  }).select('name stock lowStockThreshold category images');

  res.status(200).json({ success: true, count: products.length, products });
});

// ===== DASHBOARD SUMMARY =====
router.get('/dashboard', ...adminOnly, async (req, res) => {
  const Order = require('../models/Order');
  const [totalUsers, totalProducts, totalOrders, recentOrders, lowStockProducts] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
      Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } }).limit(5).select('name stock'),
    ]);

  const revenueResult = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
    },
    recentOrders,
    lowStockProducts,
  });
});

module.exports = router;

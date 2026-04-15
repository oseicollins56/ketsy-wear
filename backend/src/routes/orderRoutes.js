const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  uploadTransferProof,
  getAnalytics,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many checkout attempts, please try again later' },
});

router.post('/', protect, checkoutLimiter, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/transfer-proof', protect, uploadTransferProof);

module.exports = router;

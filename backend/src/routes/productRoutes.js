const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  addReview,
  getFeaturedProducts,
  getCategories,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.route('/').get(getProducts).post(protect, authorize('admin'), createProduct);
router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);
router.post('/:id/images', protect, authorize('admin'), upload.array('images', 10), uploadProductImages);
router.post('/:id/reviews', protect, addReview);

module.exports = router;

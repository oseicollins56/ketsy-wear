const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products (with filtering, sorting, pagination)
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    color,
    size,
    search,
    sort = '-createdAt',
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (featured) query.featured = featured === 'true';
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (color) query['customizationOptions.availableColors.name'] = new RegExp(color, 'i');
  if (size) query['customizationOptions.availableSizes'] = size;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sort).skip(skip).limit(Number(limit));

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    products,
  });
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.status(200).json({ success: true, product });
};

// @desc    Create product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.status(200).json({ success: true, product });
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  // Delete images from cloudinary
  for (const image of product.images) {
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }
  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted' });
};

// @desc    Upload product images
// @route   POST /api/products/:id/images
exports.uploadProductImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please upload at least one image' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const uploadPromises = req.files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'ketsy/products', transformation: [{ width: 800, quality: 'auto' }] },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id });
        }
      ).end(file.buffer);
    });
  });

  const uploadedImages = await Promise.all(uploadPromises);
  product.images.push(...uploadedImages);
  await product.save();

  res.status(200).json({ success: true, images: product.images });
};

// @desc    Add/update product review
// @route   POST /api/products/:id/reviews
exports.addReview = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const { rating, comment } = req.body;
  const existingReview = product.reviews.find(
    (r) => r.user.toString() === req.user.id.toString()
  );

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    product.reviews.push({ user: req.user.id, name: req.user.name, rating, comment });
  }

  product.calculateAverageRating();
  await product.save();

  res.status(200).json({ success: true, product });
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ featured: true, isActive: true }).limit(8);
  res.status(200).json({ success: true, products });
};

// @desc    Get product categories with counts
// @route   GET /api/products/categories
exports.getCategories = async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.status(200).json({ success: true, categories });
};

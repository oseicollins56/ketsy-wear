const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  colorHex: String,
  stock: { type: Number, default: 0 },
  sku: String,
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: true,
      enum: ['t-shirts', 'joggers', 'shorts', 'caps', 'cups', 'crop-tops', 'frames'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: { type: Number, default: 0 },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        alt: String,
      },
    ],
    variants: [variantSchema],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    isCustomizable: { type: Boolean, default: true },
    customizationOptions: {
      allowTextOverlay: { type: Boolean, default: true },
      allowImageUpload: { type: Boolean, default: true },
      allowColorChange: { type: Boolean, default: true },
      availableColors: [{ name: String, hex: String }],
      availableSizes: [String],
    },
    tags: [String],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 },
    sold: { type: Number, default: 0 },
    weight: Number,
    dimensions: { length: Number, width: Number, height: Number },
  },
  { timestamps: true }
);

// Calculate average rating
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const avg = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.rating = Math.round(avg * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ featured: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);

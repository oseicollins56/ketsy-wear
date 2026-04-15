const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  image: String,
  size: String,
  color: String,
  customization: {
    hasCustomization: { type: Boolean, default: false },
    textOverlay: String,
    textColor: String,
    fontSize: Number,
    uploadedImageUrl: String,
    position: { x: Number, y: Number },
    previewImage: String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: 'Ghana' },
      postalCode: String,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'mobile-money', 'bank-transfer'],
      required: true,
    },
    paymentResult: {
      provider: String,
      reference: String,
      status: String,
      transactionId: String,
      paidAt: Date,
      receiptUrl: String,
    },
    mobileMoneyDetails: {
      network: { type: String, enum: ['MTN', 'Vodafone', 'AirtelTigo'] },
      phone: String,
    },
    bankTransferDetails: {
      proofOfPayment: String,
      bankName: String,
      accountName: String,
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    couponCode: String,
    discountAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    trackingNumber: String,
    trackingUrl: String,
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    notes: String,
    invoiceUrl: String,
  },
  { timestamps: true }
);

// Generate order number before save
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `KW-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: String,
    sku: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },

    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['RAZORPAY', 'COD'], required: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
    },

    orderStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RTO'],
      default: 'PENDING',
    },

    shipping: {
      provider: { type: String, default: 'SHIPROCKET' },
      shipmentId: String,
      awbCode: String,
      courierName: String,
      trackingUrl: String,
      status: {
        type: String,
        enum: [
          'NOT_CREATED', 'CREATED', 'PICKUP_SCHEDULED', 'PICKED_UP',
          'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RTO', 'RETURNED',
        ],
        default: 'NOT_CREATED',
      },
    },

    cancelledAt: Date,
    cancellationReason: String,
  },
  { timestamps: true }
);

// Auto-generate a human-readable order number before first save
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

orderSchema.index({ userId: 1 });

module.exports = mongoose.model('Order', orderSchema);
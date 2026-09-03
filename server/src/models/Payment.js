const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    paymentMethod: { type: String, enum: ['RAZORPAY', 'COD'], required: true },
    provider: { type: String, enum: ['RAZORPAY', 'COD'], required: true },

    razorpayOrderId: String,
    razorpayPaymentId: String,

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
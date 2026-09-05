const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    refundNumber: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    returnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Return' },
    scheduledAt: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    amount: { type: Number, required: true },
    method: { type: String, enum: ['RAZORPAY', 'BANK_TRANSFER', 'UPI'], required: true },
    razorpayRefundId: String,

    status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    reason: String,
    processedAt: Date,
  },
  { timestamps: true }
);

refundSchema.pre('validate', function () {
  if (!this.refundNumber) {
    this.refundNumber = 'REF' + Date.now() + Math.floor(Math.random() * 1000);
  }
});

module.exports = mongoose.model('Refund', refundSchema);
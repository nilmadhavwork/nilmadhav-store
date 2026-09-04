const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    returnNumber: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        reason: String,
      },
    ],

    reason: String,
    description: String,
    images: [String],

    status: {
      type: String,
      enum: [
        'REQUESTED', 'APPROVED', 'REJECTED', 'PICKUP_SCHEDULED',
        'PICKED_UP', 'RECEIVED', 'QUALITY_CHECK', 'REFUND_INITIATED', 'REFUNDED', 'CLOSED',
      ],
      default: 'REQUESTED',
    },

    reverseShipmentId: String,
  },
  { timestamps: true }
);

returnSchema.pre('validate', function () {
  if (!this.returnNumber) {
    this.returnNumber = 'RET' + Date.now() + Math.floor(Math.random() * 1000);
  }
});

module.exports = mongoose.model('Return', returnSchema);
const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// @route POST /api/payments/razorpay/create-order
// Body: { "orderId": "<your Order _id>" }
// Creates a Razorpay order matching your Order's totalAmount, for the frontend checkout modal to use.
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.userId.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: 'Not authorized' });

    if (order.paymentMethod !== 'RAZORPAY') {
      return res.status(400).json({ message: 'This order is not set up for Razorpay payment' });
    }
    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Razorpay expects amount in paise (smallest currency unit)
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order.orderNumber,
    });

    // Create/update a Payment record in PENDING state
    let payment = await Payment.findOne({ orderId: order._id });
    if (!payment) {
      payment = await Payment.create({
        orderId: order._id,
        userId: req.user._id,
        paymentMethod: 'RAZORPAY',
        provider: 'RAZORPAY',
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        status: 'PENDING',
      });
    } else {
      payment.razorpayOrderId = razorpayOrder.id;
      payment.status = 'PENDING';
      await payment.save();
    }

    res.status(201).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // frontend needs this to open Razorpay checkout
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/razorpay/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Called by frontend after Razorpay checkout modal completes.
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing Razorpay verification fields' });
    }

    // Recreate the expected signature using your secret key and compare
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    if (generatedSignature !== razorpay_signature) {
      payment.status = 'FAILED';
      await payment.save();
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch' });
    }

    // Signature valid — mark payment and order as paid
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = 'SUCCESS';
    await payment.save();

    const order = await Order.findById(payment.orderId);
    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    await order.save();

    res.json({ message: 'Payment verified successfully', payment, order });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/payments/cod/confirm — admin only
// Body: { "orderId": "<id>" }
// For COD orders: admin marks payment as collected once courier confirms cash was received.
const confirmCodPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod !== 'COD') {
      return res.status(400).json({ message: 'This order is not a COD order' });
    }

    let payment = await Payment.findOne({ orderId: order._id });
    if (!payment) {
      payment = await Payment.create({
        orderId: order._id,
        userId: order.userId,
        paymentMethod: 'COD',
        provider: 'COD',
        amount: order.totalAmount,
        status: 'SUCCESS',
      });
    } else {
      payment.status = 'SUCCESS';
      await payment.save();
    }

    order.paymentStatus = 'PAID';
    await order.save();

    res.json({ message: 'COD payment confirmed', payment, order });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/payments/order/:orderId — view payment record for an order
const getPaymentByOrder = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return res.status(404).json({ message: 'No payment record found for this order' });

    const isOwner = payment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment, confirmCodPayment, getPaymentByOrder };
const razorpayInstance = require("../config/razorpay");
const Refund = require("../models/Refund");
const Return = require("../models/Return");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

// @route POST /api/refunds — admin only, initiate a refund for an approved/received return
// Body: { returnId }
const createRefund = async (req, res, next) => {
  try {
    const { returnId } = req.body;

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest)
      return res.status(404).json({ message: "Return not found" });

    if (!["RECEIVED", "QUALITY_CHECK"].includes(returnRequest.status)) {
      return res
        .status(400)
        .json({
          message:
            "Return must be received and quality-checked before refunding",
        });
    }

    const order = await Order.findById(returnRequest.orderId);
    const payment = await Payment.findOne({ orderId: order._id });
    if (!payment)
      return res
        .status(404)
        .json({ message: "Original payment record not found" });

    // NEW: block refund if the original payment was never actually successful
    if (payment.status !== "SUCCESS") {
      return res.status(400).json({
        message: `Cannot refund — original payment status is '${payment.status}', not confirmed as paid`,
      });
    }

    // NEW: double-check against the order's own paymentStatus too, as a second safeguard
    if (
      order.paymentStatus !== "PAID" &&
      order.paymentStatus !== "PARTIALLY_REFUNDED"
    ) {
      return res.status(400).json({
        message: `Cannot refund — order paymentStatus is '${order.paymentStatus}'`,
      });
    }

    // Calculate refund amount based on returned items only
    let refundAmount = 0;
    for (const returnItem of returnRequest.items) {
      const orderedItem = order.items.find(
        (oi) => oi.productId.toString() === returnItem.productId.toString(),
      );
      if (orderedItem) {
        refundAmount += orderedItem.price * returnItem.quantity;
      }
    }

    let refund;

    if (payment.provider === "RAZORPAY") {
      // Trigger actual Razorpay refund
      const razorpayRefund = await razorpayInstance.payments.refund(
        payment.razorpayPaymentId,
        {
          amount: Math.round(refundAmount * 100), // paise
        },
      );

      refund = await Refund.create({
        orderId: order._id,
        paymentId: payment._id,
        returnId: returnRequest._id,
        userId: returnRequest.userId,
        amount: refundAmount,
        method: "RAZORPAY",
        razorpayRefundId: razorpayRefund.id,
        status: "PROCESSING",
        reason: returnRequest.reason,
      });
    } else {
      // COD — manual bank transfer/UPI, admin marks as processing then completes it separately
      refund = await Refund.create({
        orderId: order._id,
        paymentId: payment._id,
        returnId: returnRequest._id,
        userId: returnRequest.userId,
        amount: refundAmount,
        method: "BANK_TRANSFER", // or 'UPI', admin can update
        status: "PENDING",
        reason: returnRequest.reason,
      });
    }

    returnRequest.status = "REFUND_INITIATED";
    await returnRequest.save();

    res.status(201).json(refund);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/refunds/:id/complete — admin only
// For COD refunds paid manually via bank/UPI, mark as completed once transfer is done.
const completeRefund = async (req, res, next) => {
  try {
    const { method } = req.body; // optional: confirm/change method (BANK_TRANSFER or UPI)

    const refund = await Refund.findById(req.params.id);
    if (!refund) return res.status(404).json({ message: "Refund not found" });

    refund.status = "COMPLETED";
    refund.processedAt = new Date();
    if (method) refund.method = method;
    await refund.save();

    // Update the linked return and order
    const returnRequest = await Return.findById(refund.returnId);
    if (returnRequest) {
      returnRequest.status = "REFUNDED";
      await returnRequest.save();
    }

    const order = await Order.findById(refund.orderId);
    if (order) {
      order.paymentStatus = "PARTIALLY_REFUNDED"; // full-refund logic can be refined later
      await order.save();
    }

    res.json(refund);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/refunds/my — customer's own refunds
const getMyRefunds = async (req, res, next) => {
  try {
    const refunds = await Refund.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(refunds);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/refunds — admin only, all refunds
const getAllRefunds = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const refunds = await Refund.find(filter)
      .populate("userId", "name email")
      .populate("orderId", "orderNumber")
      .sort({ createdAt: -1 });
    res.json(refunds);
  } catch (error) {
    next(error);
  }
};

module.exports = { createRefund, completeRefund, getMyRefunds, getAllRefunds };

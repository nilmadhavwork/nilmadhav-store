const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Address = require("../models/Address");
const Setting = require("../models/Setting");
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');

// @route POST /api/orders — place an order from the current cart
const createOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod } = req.body;

    if (!addressId || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "addressId and paymentMethod are required" });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId: req.user._id,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    const orderItems = [];

    // Re-validate every item against live product data — never trust cart's stored price
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);

      if (!product || !product.isActive) {
        return res
          .status(400)
          .json({
            message: `Product no longer available: ${cartItem.productId}`,
          });
      }
      if (product.stock < cartItem.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      const currentPrice = product.discountPrice || product.price;
      const lineTotal = currentPrice * cartItem.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: cartItem.quantity,
        price: currentPrice,
        total: lineTotal,
        image: product.images[0]?.url || "",
      });

      // Decrement stock
      product.stock -= cartItem.quantity;
      await product.save();
    }

    // Shipping cost from Settings (flat rate + free-shipping threshold)
    const settings = await Setting.getSettings();
    const shippingCost =
      subtotal >= settings.shippingSettings.freeShippingAbove
        ? 0
        : settings.shippingSettings.defaultShippingCharge;

    const discount = 0; // no coupon system yet — placeholder for future
    const totalAmount = subtotal + shippingCost - discount;

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
      },
      subtotal,
      shippingCost,
      discount,
      totalAmount,
      paymentMethod, // 'RAZORPAY' or 'COD'
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING", // updated after Razorpay verification
    });

    // For COD orders, the order is confirmed immediately — clear the cart now.
    // For online payments (RAZORPAY), keep the cart until payment is actually verified.
    if (paymentMethod === "COD") {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/orders/my — logged-in customer's own orders
const getMyOrders = async (req, res, next) => {
  try {
    // Exclude abandoned/unpaid Razorpay checkout attempts
    const orders = await Order.find({
      userId: req.user._id,
      $or: [
        { paymentMethod: "COD" },
        { paymentStatus: { $in: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] } },
        { orderStatus: "CANCELLED" },
      ],
    }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/orders/:id — single order (owner or admin only)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email phone",
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/orders — admin only, all orders (filterable by status)
const getAllOrders = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    } else {
      filter.$or = [
        { paymentMethod: "COD" },
        { paymentStatus: { $in: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] } },
        { orderStatus: "CANCELLED" },
      ];
    }

    const orders = await Order.find(filter)
      .populate("userId", "name email phone")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/orders/:id/status — admin only, update order lifecycle status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RTO",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid orderStatus value" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true },
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/orders/:id/shipping — admin only, fill in Shiprocket shipment details manually
const updateShippingInfo = async (req, res, next) => {
  try {
    const { shipmentId, awbCode, courierName, trackingUrl, status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (shipmentId) order.shipping.shipmentId = shipmentId;
    if (awbCode) order.shipping.awbCode = awbCode;
    if (courierName) order.shipping.courierName = courierName;
    if (trackingUrl) order.shipping.trackingUrl = trackingUrl;
    if (status) order.shipping.status = status;

    // Keep orderStatus roughly in sync with shipping status
    if (status === "PICKED_UP") order.orderStatus = "SHIPPED";
    if (status === "OUT_FOR_DELIVERY") order.orderStatus = "OUT_FOR_DELIVERY";
    if (status === "DELIVERED") order.orderStatus = "DELIVERED";

    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/orders/:id/cancel — customer (own order) or admin
const cancelOrder = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    if (
      ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Order already shipped, cannot cancel — request a return instead",
        });
    }

    // Restore stock for cancelled items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = "CANCELLED";
    order.cancelledAt = new Date();
    order.cancellationReason = cancellationReason || "No reason provided";

    if (order.paymentStatus === "PAID") {
      const payment = await Payment.findOne({ orderId: order._id });

      if (payment && payment.status === "SUCCESS") {
        const settings = await Setting.getSettings();
        const refundDays = settings.refundSettings.refundProcessingDays;
        const scheduledAt = new Date(
          Date.now() + refundDays * 24 * 60 * 60 * 1000,
        );

        await Refund.create({
          orderId: order._id,
          paymentId: payment._id,
          returnId: null,
          userId: order.userId,
          amount: order.totalAmount,
          method:
            payment.provider === "RAZORPAY" ? "RAZORPAY" : "BANK_TRANSFER",
          status: "PENDING", // sits here — admin must manually trigger it, and only after scheduledAt
          scheduledAt,
          reason: `Order cancelled: ${order.cancellationReason}`,
        });
      }
    }

    await order.save();

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/orders/:id/unpaid — discard an unpaid Razorpay checkout attempt
const discardUnpaidOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderUserId = order.userId?._id ? order.userId._id.toString() : order.userId.toString();
    const isOwner = orderUserId === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only allow discarding if it was an online payment and was never confirmed as paid
    if (order.paymentMethod === "RAZORPAY" && order.paymentStatus === "PENDING") {
      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      // Delete any pending payment records for this order
      await Payment.deleteMany({ orderId: order._id });

      // Delete the order itself from database
      await Order.findByIdAndDelete(order._id);

      return res.json({ message: "Unpaid order discarded and stock restored" });
    }

    res.status(400).json({ message: "Only unpaid online orders can be discarded" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateShippingInfo,
  cancelOrder,
  discardUnpaidOrder,
};
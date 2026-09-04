const Return = require("../models/Return");
const Order = require("../models/Order");
const Setting = require("../models/Setting");
const uploadBufferToCloudinary = require("../utils/uploadToCloudinary");

// @route POST /api/returns — customer requests a return
// Body: { orderId, items: [{ productId, quantity, reason }], reason, description, images }
// reuse existing helper
const createReturn = async (req, res, next) => {
  try {
    const { orderId, items, reason, description } = req.body;
    // Note: items comes as a JSON string when sent via multipart form-data — parse it
    const parsedItems = typeof items === "string" ? JSON.parse(items) : items;

    if (!orderId || !parsedItems || parsedItems.length === 0) {
      return res
        .status(400)
        .json({ message: "orderId and items are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.userId.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: "Not authorized" });

    if (order.orderStatus !== "DELIVERED") {
      return res
        .status(400)
        .json({ message: "Only delivered orders can be returned" });
    }

    // NEW: block return requests on orders that were never actually paid for
    if (order.paymentStatus !== "PAID") {
      return res.status(400).json({
        message: `Cannot request return — order paymentStatus is '${order.paymentStatus}', not confirmed as paid`,
      });
    }

    const settings = await Setting.getSettings();
    if (!settings.returnSettings.returnEnabled) {
      return res
        .status(400)
        .json({ message: "Returns are currently disabled" });
    }

    const deliveredAt = order.updatedAt;
    const daysSinceDelivery =
      (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > settings.returnSettings.returnWindowDays) {
      return res
        .status(400)
        .json({
          message: `Return window of ${settings.returnSettings.returnWindowDays} days has expired`,
        });
    }

    for (const item of parsedItems) {
      const orderedItem = order.items.find(
        (oi) => oi.productId.toString() === item.productId,
      );
      if (!orderedItem) {
        return res
          .status(400)
          .json({
            message: `Product ${item.productId} was not part of this order`,
          });
      }
      if (item.quantity > orderedItem.quantity) {
        return res
          .status(400)
          .json({
            message: `Return quantity exceeds ordered quantity for ${orderedItem.productName}`,
          });
      }
    }

    // Actually upload proof-of-damage/wrong-item images if any were attached
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map((file) =>
          uploadBufferToCloudinary(file.buffer, "saree-returns"),
        ),
      );
      images = uploadResults.map((result) => result.secure_url);
    }

    const returnRequest = await Return.create({
      orderId,
      userId: req.user._id,
      items: parsedItems,
      reason,
      description,
      images,
    });

    res.status(201).json(returnRequest);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/returns/my — customer's own return requests
const getMyReturns = async (req, res, next) => {
  try {
    const returns = await Return.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(returns);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/returns — admin only, all return requests
const getAllReturns = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const returns = await Return.find(filter)
      .populate("userId", "name email phone")
      .populate("orderId", "orderNumber totalAmount")
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/returns/:id
const getReturnById = async (req, res, next) => {
  try {
    const returnRequest = await Return.findById(req.params.id).populate(
      "orderId",
    );
    if (!returnRequest)
      return res.status(404).json({ message: "Return not found" });

    const isOwner = returnRequest.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Not authorized" });

    res.json(returnRequest);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/returns/:id/status — admin only
// Body: { status, reverseShipmentId? }
const updateReturnStatus = async (req, res, next) => {
  try {
    const { status, reverseShipmentId } = req.body;
    const validStatuses = [
      "REQUESTED",
      "APPROVED",
      "REJECTED",
      "PICKUP_SCHEDULED",
      "PICKED_UP",
      "RECEIVED",
      "QUALITY_CHECK",
      "REFUND_INITIATED",
      "REFUNDED",
      "CLOSED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest)
      return res.status(404).json({ message: "Return not found" });

    returnRequest.status = status;
    if (reverseShipmentId) returnRequest.reverseShipmentId = reverseShipmentId;

    await returnRequest.save();
    res.json(returnRequest);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReturn,
  getMyReturns,
  getAllReturns,
  getReturnById,
  updateReturnStatus,
};

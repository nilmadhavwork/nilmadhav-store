const express = require('express');
const {
  createOrder, getMyOrders, getOrderById, getAllOrders,
  updateOrderStatus, updateShippingInfo, cancelOrder, discardUnpaidOrder,
} = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // every order route requires login

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.delete('/:id/unpaid', discardUnpaidOrder);

// Admin only
router.get('/', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);
router.put('/:id/shipping', adminOnly, updateShippingInfo);

module.exports = router;
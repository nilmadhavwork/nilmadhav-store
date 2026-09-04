const express = require('express');
const {
  createRazorpayOrder, verifyRazorpayPayment, confirmCodPayment, getPaymentByOrder,
} = require('../controllers/payment.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.get('/order/:orderId', getPaymentByOrder);

router.post('/cod/confirm', adminOnly, confirmCodPayment);

module.exports = router;
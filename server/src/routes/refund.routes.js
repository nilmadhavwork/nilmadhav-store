const express = require('express');
const { createRefund, completeRefund, getMyRefunds, getAllRefunds, initiateScheduledRefund} = require('../controllers/refund.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/my', getMyRefunds);

router.post('/', adminOnly, createRefund);
router.put('/:id/complete', adminOnly, completeRefund);
router.get('/', adminOnly, getAllRefunds);
router.put('/:id/initiate', adminOnly, initiateScheduledRefund);

module.exports = router;
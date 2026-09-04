const express = require('express');
const {
  createReturn, getMyReturns, getAllReturns, getReturnById, updateReturnStatus,
} = require('../controllers/return.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.post('/', upload.array('images', 4), createReturn);
router.get('/my', getMyReturns);
router.get('/:id', getReturnById);

router.get('/', adminOnly, getAllReturns);
router.put('/:id/status', adminOnly, updateReturnStatus);

module.exports = router;
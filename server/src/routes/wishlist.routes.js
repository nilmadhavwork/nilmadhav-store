const express = require('express');
const {
  getWishlist, addToWishlist, removeFromWishlist, moveToCart,
} = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/:productId/move-to-cart', moveToCart);

module.exports = router;
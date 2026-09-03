const express = require('express');
const {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProductImage,
  deleteProduct,
} = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Admin only
router.post('/', protect, adminOnly, upload.array('images', 6), createProduct); // max 6 images
router.put('/:id', protect, adminOnly, upload.array('images', 6), updateProduct);
router.delete('/:id/images', protect, adminOnly, deleteProductImage);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
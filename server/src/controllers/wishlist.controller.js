const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [] });
  }
  return wishlist;
};

// @route GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    await wishlist.populate('products.productId', 'name slug price discountPrice images isActive');
    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/wishlist/:productId
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const wishlist = await getOrCreateWishlist(req.user._id);
    const alreadyExists = wishlist.products.some((p) => p.productId.toString() === productId);

    if (!alreadyExists) {
      wishlist.products.push({ productId });
      await wishlist.save();
    }

    await wishlist.populate('products.productId', 'name slug price discountPrice images isActive');
    res.status(201).json(wishlist);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    wishlist.products = wishlist.products.filter(
      (p) => p.productId.toString() !== req.params.productId
    );
    await wishlist.save();
    await wishlist.populate('products.productId', 'name slug price discountPrice images isActive');
    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/wishlist/:productId/move-to-cart
const moveToCart = async (req, res, next) => {
  try {
    const Cart = require('../models/Cart');
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product || !product.isActive || product.stock < 1) {
      return res.status(400).json({ message: 'Product unavailable' });
    }

    // Add to cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const effectivePrice = (product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price)
        ? product.discountPrice
        : product.price;
      cart.items.push({ productId, quantity: 1, price: effectivePrice });
    }
    await cart.save();

    // Remove from wishlist
    const wishlist = await getOrCreateWishlist(req.user._id);
    wishlist.products = wishlist.products.filter((p) => p.productId.toString() !== productId);
    await wishlist.save();

    res.json({ message: 'Moved to cart', cart, wishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, moveToCart };
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper: get or create a cart for the logged-in user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

// @route GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate('items.productId', 'name slug price discountPrice images stock isActive');
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/cart/items — add a product to cart (or increase qty if already present)
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find((item) => item.productId.toString() === productId);

    const effectivePrice = (product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price)
      ? product.discountPrice
      : product.price;

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      existingItem.price = effectivePrice; // refresh price snapshot
    } else {
      cart.items.push({
        productId,
        quantity,
        price: effectivePrice,
      });
    }

    await cart.save();
    await cart.populate('items.productId', 'name slug price discountPrice images stock isActive');
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/cart/items/:productId — update quantity of an item already in cart
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'quantity must be at least 1' });
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((item) => item.productId.toString() === productId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.productId', 'name slug price discountPrice images stock isActive');
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/cart/items/:productId — remove one item from cart
const removeCartItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((item) => item.productId.toString() !== req.params.productId);
    await cart.save();
    await cart.populate('items.productId', 'name slug price discountPrice images stock isActive');
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/cart — clear entire cart (e.g. after order is placed)
const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
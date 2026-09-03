const slugify = require("slugify");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary.js");
const uploadBufferToCloudinary = require("../utils/uploadToCloudinary");

// @route POST /api/products (admin only)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      categoryId,
      price,
      discountPrice,
      stock,
      sku,
      fabric,
      color,
      pattern,
      occasion,
      blouseIncluded,
      blouseColor,
      careInstructions,
    } = req.body;

    if (!name || !description || !categoryId || !price || !sku) {
      return res
        .status(400)
        .json({
          message: "name, description, categoryId, price, and sku are required",
        });
    }

    let slug = slugify(name, { lower: true, strict: true });
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    // Upload each file buffer to Cloudinary in parallel
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer)),
      );
      images = uploadResults.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: index === 0,
        sortOrder: index,
      }));
    }

    const product = await Product.create({
      name,
      slug,
      description,
      categoryId,
      price,
      discountPrice,
      stock,
      sku,
      fabric,
      color,
      pattern,
      occasion,
      blouseIncluded: blouseIncluded === "true" || blouseIncluded === true,
      blouseColor,
      careInstructions,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/products (public) — supports search, filters, pagination
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      fabric,
      color,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };
    if (category) filter.categoryId = category;
    if (fabric) filter.fabric = new RegExp(fabric, "i");
    if (color) filter.color = new RegExp(color, "i");
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search }; // uses the text index from your Product model

    const products = await Product.find(filter)
      .populate("categoryId", "name slug")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/products/:slug (public)
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("categoryId", "name slug");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/products/:id (admin only) — updates fields; optionally add new images
const updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true, strict: true });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // If new images were uploaded, append them to existing images
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer)),
      );
      const newImages = uploadResults.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: product.images.length === 0 && index === 0,
        sortOrder: product.images.length + index,
      }));
      updateData.images = [...product.images, ...newImages];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/products/:id/images (admin only) — remove a single image
// Expects JSON body: { "publicId": "saree-products/xk3j9d8fj2l1" }
const deleteProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'publicId is required in request body' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await cloudinary.uploader.destroy(publicId);

    product.images = product.images.filter((img) => img.publicId !== publicId);
    await product.save();

    res.json({ message: 'Image removed', product });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/products/:id (admin only) — soft delete
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deactivated", product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProductImage,
  deleteProduct,
};

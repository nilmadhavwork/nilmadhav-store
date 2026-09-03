const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary public_id, needed to delete/replace image later
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    price: { type: Number, required: true },
    discountPrice: { type: Number }, // optional, leave blank if no discount
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },

    fabric: { type: String },
    color: { type: String },
    pattern: { type: String },
    occasion: { type: String }, // e.g. Wedding, Party, Casual
    blouseIncluded: { type: Boolean, default: false },
    blouseColor: { type: String },
    careInstructions: { type: String },

    images: [imageSchema],

    isActive: { type: Boolean, default: true }, // soft delete
  },
  { timestamps: true }
);

productSchema.index({ categoryId: 1 });
productSchema.index({ name: 'text', description: 'text' }); // enables text search

module.exports = mongoose.model('Product', productSchema);
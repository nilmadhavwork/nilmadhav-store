const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, required: true },
    email: String,
    phone: String,

    address: {
      city: String,
      state: String,
      pincode: String,
    },

    shippingSettings: {
      freeShippingAbove: { type: Number, default: 0 },
      defaultShippingCharge: { type: Number, default: 0 },
    },

    returnSettings: {
      returnWindowDays: { type: Number, default: 7 },
      returnEnabled: { type: Boolean, default: true },
    },

    codSettings: {
      enabled: { type: Boolean, default: true },
    },

    paymentSettings: {
      razorpayEnabled: { type: Boolean, default: true },
    },

    refundSettings: {
      refundProcessingDays: { type: Number, default: 7 },
    },
  },
  { timestamps: true },
);

// Enforces a single settings document — always fetch/update the same one
settingSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ storeName: "My Saree Store" });
  }
  return settings;
};

module.exports = mongoose.model("Setting", settingSchema);

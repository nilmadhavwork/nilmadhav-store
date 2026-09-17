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
      freeShippingEnabled: { type: Boolean, default: true },
      freeShippingAbove: { type: Number, default: 5000 },
      defaultShippingCharge: { type: Number, default: 150 },
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
    settings = await this.create({
      storeName: "Nilmadhav Sarees",
      shippingSettings: { freeShippingEnabled: true, freeShippingAbove: 5000, defaultShippingCharge: 150 },
    });
  }
  return settings;
};

module.exports = mongoose.model("Setting", settingSchema);

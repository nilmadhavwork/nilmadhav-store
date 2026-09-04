const Setting = require('../models/Setting');

// @route GET /api/settings — public (storefront needs to read shipping charge, COD toggle, etc.)
const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.getSettings(); // auto-creates default doc if none exists
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/settings — admin only, update the single settings document
const updateSettings = async (req, res, next) => {
  try {
    const settings = await Setting.getSettings();

    // Only update fields that were actually sent, so partial updates work
    const {
      storeName, email, phone, address,
      shippingSettings, returnSettings, codSettings, paymentSettings,
    } = req.body;

    if (storeName !== undefined) settings.storeName = storeName;
    if (email !== undefined) settings.email = email;
    if (phone !== undefined) settings.phone = phone;
    if (address !== undefined) settings.address = { ...settings.address.toObject(), ...address };
    if (shippingSettings !== undefined) {
      settings.shippingSettings = { ...settings.shippingSettings.toObject(), ...shippingSettings };
    }
    if (returnSettings !== undefined) {
      settings.returnSettings = { ...settings.returnSettings.toObject(), ...returnSettings };
    }
    if (codSettings !== undefined) {
      settings.codSettings = { ...settings.codSettings.toObject(), ...codSettings };
    }
    if (paymentSettings !== undefined) {
      settings.paymentSettings = { ...settings.paymentSettings.toObject(), ...paymentSettings };
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
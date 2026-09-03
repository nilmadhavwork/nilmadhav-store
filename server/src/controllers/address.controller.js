const Address = require('../models/Address');

// @route POST /api/addresses
const createAddress = async (req, res, next) => {
  try {
    const {
      fullName, phone, addressLine1, addressLine2,
      city, state, pincode, country, addressType, isDefault,
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ message: 'fullName, phone, addressLine1, city, state, and pincode are required' });
    }

    // If this is marked default, unset default on any other address for this user
    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      userId: req.user._id,
      fullName, phone, addressLine1, addressLine2,
      city, state, pincode, country, addressType, isDefault,
    });

    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/addresses — all addresses for logged-in user
const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/addresses/:id
const getAddressById = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/addresses/:id
const updateAddress = async (req, res, next) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/addresses/:id
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAddress, getMyAddresses, getAddressById, updateAddress, deleteAddress };
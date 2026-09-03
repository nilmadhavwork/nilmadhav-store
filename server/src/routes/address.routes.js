const express = require('express');
const {
  createAddress, getMyAddresses, getAddressById, updateAddress, deleteAddress,
} = require('../controllers/address.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // addresses are always tied to the logged-in user

router.post('/', createAddress);
router.get('/', getMyAddresses);
router.get('/:id', getAddressById);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
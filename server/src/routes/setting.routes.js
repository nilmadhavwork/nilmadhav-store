const express = require('express');
const { getSettings, updateSettings } = require('../controllers/setting.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getSettings); // public — storefront needs this to show shipping/COD info
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
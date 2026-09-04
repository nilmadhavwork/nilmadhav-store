const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Validate email domain after @
    const allowedEmailDomains = [
      'gmail.com',
      'yahoo.com',
      'yahoo.co.in',
      'yahoo.co.uk',
      'ymail.com',
      'outlook.com',
      'hotmail.com',
      'live.com',
      'msn.com',
      'icloud.com',
      'rediffmail.com',
      'zoho.com',
      'proton.me',
      'protonmail.com',
      'aol.com',
    ];

    const emailParts = email.toLowerCase().trim().split('@');
    const domain = emailParts[1];
    if (!domain || !allowedEmailDomains.includes(domain)) {
      return res.status(400).json({
        message: 'Please register with a valid email provider (Gmail, Yahoo, Outlook, iCloud, etc.)',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // passwordHash gets hashed automatically by the pre-save hook in User.js
    const user = await User.create({ name, email, phone, passwordHash: password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getProfile };
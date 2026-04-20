const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
require('dotenv').config();

// Helper: handle validation errors
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  return null;
};

// Signup User
router.post('/signup',
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });

      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login User
router.post('/login',
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      res.status(200).json({ token, name: user.name, email: user.email, role: user.role });

    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
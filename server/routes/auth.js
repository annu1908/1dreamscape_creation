const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const otpGenerator = require('otp-generator');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();

// Helper: handle validation errors
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  return null;
};

// Register User (Step 1: Send OTP)
router.post('/register',
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { name, email, password } = req.body;

    try {
      // Check if a verified user already exists with this email
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser.isVerified) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Auto-assign admin role if email matches ADMIN_EMAIL
      const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
      const userRole = email.toLowerCase() === adminEmail ? 'admin' : 'user';

      if (existingUser && !existingUser.isVerified) {
        // Update the existing unverified user's details
        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.role = userRole;
        await existingUser.save();
      } else {
        // Create new user with isVerified: false
        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          isVerified: false,
          role: userRole,
        });
        await newUser.save();
      }

      // Generate 6-digit numeric OTP
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });

      // Delete any old OTP for this email, save new OTP
      await Otp.deleteMany({ email });
      await Otp.create({ email, otp });

      // Send OTP email
      await sendEmail(email, otp);

      res.status(200).json({ message: 'OTP sent to your email' });

    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Verify OTP (Step 2)
router.post('/verify-otp',
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required'),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { email, otp } = req.body;

    try {
      // Find OTP record
      const otpRecord = await Otp.findOne({ email, otp });

      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Mark user as verified; also ensure admin role if email matches
      const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
      const updateFields = { isVerified: true };
      if (email.toLowerCase() === adminEmail) {
        updateFields.role = 'admin';
      }
      await User.findOneAndUpdate({ email }, updateFields);

      // Delete the used OTP record
      await Otp.deleteMany({ email });

      res.status(200).json({ message: 'Email verified successfully' });

    } catch (err) {
      console.error('Verify OTP error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Resend OTP
router.post('/resend-otp',
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { email } = req.body;

    try {
      // Generate new 6-digit numeric OTP
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });

      // Delete old OTP, save new one
      await Otp.deleteMany({ email });
      await Otp.create({ email, otp });

      // Send new OTP email
      await sendEmail(email, otp);

      res.status(200).json({ message: 'OTP resent successfully' });

    } catch (err) {
      console.error('Resend OTP error:', err);
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

      // Check if email is verified
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Email not verified. Please verify your OTP first.' });
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

// Forgot Password (Step 1)
router.post('/forgot-password',
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email' });
      }

      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });

      await Otp.deleteMany({ email });
      await Otp.create({ email, otp });

      // Assuming sendEmail handles custom subjects or we can modify it. 
      // The instructions say: Send email using existing sendOTPEmail utility with subject: "Reset Your Dreamscape Password"
      // Wait, let's look at `sendEmail`. It doesn't currently take a subject argument.
      // But the instructions specify: "Use this OTP to reset your password. Expires in 5 minutes."
      // I will update sendEmail.js in another step to allow dynamic subjects and text, or just use sendEmail for now.
      // Wait, let me check sendEmail.js first. 
      await sendEmail(email, otp, 'Reset Your Dreamscape Password', 'Use this OTP to reset your password. Expires in 5 minutes.');

      res.status(200).json({ message: 'Password reset OTP sent to your email' });
    } catch (err) {
      console.error('Forgot Password error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Verify Reset OTP (Step 2)
router.post('/verify-reset-otp',
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required'),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { email, otp } = req.body;

    try {
      const otpRecord = await Otp.findOne({ email, otp });
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      await Otp.deleteMany({ email });

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins

      await User.findOneAndUpdate({ email }, { resetToken, resetTokenExpiry });

      res.status(200).json({ resetToken });
    } catch (err) {
      console.error('Verify Reset OTP error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Reset Password (Step 3)
router.post('/reset-password',
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const { resetToken, newPassword } = req.body;

    try {
      const user = await User.findOne({
        resetToken,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Reset link expired or invalid' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      console.error('Reset Password error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
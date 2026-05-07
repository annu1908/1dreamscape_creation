const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  phone: {
    type: String,
    default: '',
  },

  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pinCode: { type: String, default: '' }
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  resetToken: {
    type: String,
    default: null,
  },
  
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('User', userSchema);
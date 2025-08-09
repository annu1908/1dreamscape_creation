const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  deliveryAddress: { type: String, required: true },

  items: [
    {
      title: String,
      price: Number,
      quantity: Number,
    }
  ],

  subtotal: Number,
  deliveryCharge: Number,
  total: Number,

  paymentId: { type: String, required: true },         // Razorpay payment ID
  paymentStatus: { type: String, default: "success" }, // Defaulting to success
   razorpayOrderId: { type: String },                // Optional if you want to store
   razorpaySignature:{type: String},

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
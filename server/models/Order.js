const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  deliveryAddress: { type: String, required: true },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: String,
      price: Number,
      quantity: Number,
      personalization: String,
    }
  ],

  subtotal: Number,
  deliveryCharge: Number,
  total: Number,

  paymentId: { type: String, required: true },         // Razorpay payment ID
  paymentStatus: { type: String, default: "success" }, // Defaulting to success
   razorpayOrderId: { type: String },                // Optional if you want to store
   razorpaySignature:{ type: String },

  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
  },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
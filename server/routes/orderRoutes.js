const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Order = require('../models/Order');
require('dotenv').config();

// Razorpay instance
const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.SECRET_KEY,
});

// ============================
// Route 1: Create Razorpay Order
// ============================
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // amount in paisa
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await instance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ error: 'Failed to create a Razorpay order' });
  }
});

// ============================
// Route 2: Save Final Order after Payment
// ============================
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      deliveryAddress,
      items,
      subtotal,
      deliveryCharge,
      total,
      paymentId,
      paymentStatus,
    } = req.body;

    const newOrder = new Order({
      customerName,
      customerEmail,
      deliveryAddress,
      items,
      subtotal,
      deliveryCharge,
      total,
      paymentId,
      paymentStatus,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: 'Order saved successfully',
      orderId: savedOrder._id,
    });
  } catch (err) {
    console.error('Order saving failed:', err);
    res.status(500).json({ message: 'Order saving failed' });
  }
});
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
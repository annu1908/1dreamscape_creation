const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const verifyToken = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
require('dotenv').config();

// Razorpay instance
const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.SECRET_KEY,
});

// ============================
// Route 1: Create Razorpay Order
// (consolidated from razorpayRoutes.js)
// ============================
router.post('/create-order', verifyToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

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
// (protected + signature verification)
// ============================
router.post('/', verifyToken, async (req, res) => {
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
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    // ✅ Verify Razorpay payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.SECRET_KEY)
      .update(razorpayOrderId + '|' + paymentId)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    const newOrder = new Order({
      userId: req.user.userId,
      customerName,
      customerEmail,
      deliveryAddress,
      items,
      subtotal,
      deliveryCharge,
      total,
      paymentId,
      paymentStatus,
      razorpayOrderId,
      razorpaySignature,
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

// ============================
// Route 3: Get All Orders (Admin Only)
// ============================
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ============================
// Route 4: Get Orders for Logged-in User
// ============================
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
});

// ============================
// Route 5: Update Order Status (Admin Only)
// ============================
router.put('/:id/status', verifyToken, adminOnly, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing status' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
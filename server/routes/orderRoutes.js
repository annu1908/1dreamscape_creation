const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { body, param, validationResult } = require('express-validator');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const verifyToken = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
require('dotenv').config();

// Razorpay instance
const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.SECRET_KEY,
});

// Helper: handle validation errors
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  return null;
};

// ============================
// Route 1: Create Razorpay Order
// ============================
router.post('/create-order', verifyToken,
  body('amount').isNumeric().withMessage('Amount must be a number').custom(v => v > 0).withMessage('Amount must be positive'),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

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
  }
);

// ============================
// Route 2: Save Final Order after Payment
// ✅ SERVER-SIDE PRICE RECALCULATION
// ============================
router.post('/', verifyToken,
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid email is required'),
  body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('paymentId').trim().notEmpty().withMessage('Payment ID is required'),
  body('razorpayOrderId').trim().notEmpty().withMessage('Razorpay Order ID is required'),
  body('razorpaySignature').trim().notEmpty().withMessage('Razorpay Signature is required'),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    try {
      const {
        customerName,
        customerEmail,
        deliveryAddress,
        items,
        paymentId,
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

      // ✅ SERVER-SIDE PRICE RECALCULATION — never trust client-sent totals
      const productIds = items.map(item => item._id || item.productId);
      const dbProducts = await Product.find({ _id: { $in: productIds } });

      const priceMap = {};
      dbProducts.forEach(p => { priceMap[p._id.toString()] = p.price; });

      const DELIVERY_CHARGE = 50; // Fixed delivery charge

      const verifiedItems = items.map(item => {
        const itemId = (item._id || item.productId || '').toString();
        const dbPrice = priceMap[itemId];
        if (!dbPrice) {
          throw new Error(`Product not found in database: ${item.title || itemId}`);
        }
        return {
          productId: itemId,
          title: item.title,
          price: dbPrice, // Use DB price, not client price
          quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        };
      });

      const calculatedSubtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const calculatedTotal = calculatedSubtotal + DELIVERY_CHARGE;

      const newOrder = new Order({
        userId: req.user.userId,
        customerName,
        customerEmail,
        deliveryAddress,
        items: verifiedItems,
        subtotal: calculatedSubtotal,
        deliveryCharge: DELIVERY_CHARGE,
        total: calculatedTotal,
        paymentId,
        paymentStatus: 'success',
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
      res.status(500).json({ message: err.message || 'Order saving failed' });
    }
  }
);

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
router.put('/:id/status', verifyToken, adminOnly,
  body('status').isIn(['processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status value'),
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
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
  }
);

module.exports = router;
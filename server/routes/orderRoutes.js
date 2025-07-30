const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @route   POST /api/orders
// @desc    Save new order
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order({
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      deliveryAddress: req.body.deliveryAddress,
      items: req.body.items,
      subtotal: req.body.subtotal,
      deliveryCharge: req.body.deliveryCharge,
      total: req.body.total
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order saved successfully' });
  } catch (err) {
    console.error('Order saving failed:', err);
    res.status(500).json({ message: 'Order saving failed' });
  }
});

module.exports = router;
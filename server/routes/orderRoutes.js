const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Razorpay=require('razorpay')
const razorpay=new Razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_SECRET_KEY,
});

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
router.post('/create-order',async(req,res)=>{
  const {amount}=req.body;
  const options={
    amount:amount*100,
    currency:'INR',
    receipt:`receipt_order_${Date.now()}`

  }
  try{
    const order=await razorpay.orders.create(options);
    res.status(200).json(order);
  }catch(error)
  {
    console.error('Razorpay order creation failed:',error);
    res.status(500).json({error:'Failed to create a razorpay order'})
  }
})
module.exports = router;
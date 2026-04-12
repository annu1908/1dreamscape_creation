const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const verifyToken = require('../middleware/authMiddleware');

// ============================
// POST: Add a review (logged-in users only)
// ============================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment, userName } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'productId, rating, and comment are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const newReview = new Review({
      productId,
      userId: req.user.userId,
      userName: userName || 'Anonymous',
      rating: Number(rating),
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);

  } catch (err) {
    // Handle duplicate review error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }
    console.error('Review creation failed:', err);
    res.status(500).json({ message: 'Failed to add review.' });
  }
});

// ============================
// GET: Get all reviews for a product
// ============================
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 });
    
    // Calculate average rating
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, avgRating: Number(avgRating), totalReviews: reviews.length });

  } catch (err) {
    console.error('Failed to fetch reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
});

module.exports = router;

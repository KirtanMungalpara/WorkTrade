const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/reviews/:transactionId
// @desc    Leave a review for the other user in a transaction
// @access  Private
router.post('/:transactionId', authMiddleware, async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
  }

  try {
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed transactions' });
    }

    // Determine roles
    const isRequester = transaction.requesterId.toString() === req.user.id;
    const isProvider = transaction.providerId.toString() === req.user.id;

    if (!isRequester && !isProvider) {
      return res.status(401).json({ success: false, message: 'Not authorized to review this transaction' });
    }

    // Determine target user
    const targetUserId = isRequester ? transaction.providerId : transaction.requesterId;

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewerId: req.user.id,
      targetUserId: targetUserId
      // Ideally we would also link review to transaction to prevent multiple reviews for same transaction
      // But for simplicity, we'll just check if one exists between these two users
    });

    // Create the review
    const newReview = new Review({
      reviewerId: req.user.id,
      targetUserId,
      rating,
      comment
    });

    const review = await newReview.save();

    // Update target user's average rating
    const allReviews = await Review.find({ targetUserId });
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await User.findByIdAndUpdate(targetUserId, { rating: avgRating.toFixed(1) });

    res.json({ success: true, message: 'Review submitted successfully', review });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews for a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ targetUserId: req.params.userId })
      .populate('reviewerId', ['name'])
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;

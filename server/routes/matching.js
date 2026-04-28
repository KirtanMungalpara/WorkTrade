const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/matching/suggestions
// @desc    Suggest users based on matching skills and optional location
// @access  Private
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Build the query
    let query = {
      _id: { $ne: currentUser._id }, // Don't suggest yourself
      skillsOffered: { $in: currentUser.servicesNeeded } // They offer what you need
    };

    // Filter by location if provided in the query string (?location=New York)
    if (req.query.location) {
      // Use regex for case-insensitive partial match
      query.location = { $regex: new RegExp(req.query.location, 'i') };
    }

    const suggestions = await User.find(query)
      .select('-password')
      .sort({ rating: -1 }) // Sort by rating highest first
      .limit(20);

    res.json({ success: true, count: suggestions.length, suggestions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/matching/providers
// @desc    Recommend best providers overall (top rated), with optional category/location filter
// @access  Public
router.get('/providers', async (req, res) => {
  try {
    let query = {};

    // Filter by specific skill/category if provided
    if (req.query.skill) {
      query.skillsOffered = { $regex: new RegExp(req.query.skill, 'i') };
    }

    // Filter by location if provided
    if (req.query.location) {
      query.location = { $regex: new RegExp(req.query.location, 'i') };
    }

    const topProviders = await User.find(query)
      .select('-password')
      .sort({ rating: -1, points: -1 }) // Best rating, then highest points
      .limit(10);

    res.json({ success: true, count: topProviders.length, providers: topProviders });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;

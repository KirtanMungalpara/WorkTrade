const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const User = require('../models/User');

// @route   POST /api/requests
// @desc    Create a new service request with optional images and voice recording
// @access  Private
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'images', maxCount: 5 }, // Allow up to 5 images
    { name: 'voice', maxCount: 1 }   // Allow 1 voice recording
  ]),
  async (req, res) => {
    const { title, description, category, pointsOffered, targetProviderId } = req.body;

    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const points = parseInt(pointsOffered);

      if (user.points < points) {
        return res.status(400).json({ success: false, message: 'Insufficient points to create this request' });
      }

      // Extract file URLs from Cloudinary upload
      let imageUrls = [];
      let voiceUrl = '';

      if (req.files) {
        if (req.files.images) {
          imageUrls = req.files.images.map(file => file.path);
        }
        if (req.files.voice) {
          voiceUrl = req.files.voice[0].path;
        }
      }

      const newRequest = new Request({
        userId: req.user.id,
        targetProviderId: targetProviderId || undefined,
        title,
        description,
        category,
        pointsOffered,
        images: imageUrls,
        voiceUrl
      });

      const request = await newRequest.save();

      // Deduct points
      user.points -= points;
      await user.save();

      res.json({ success: true, request, remainingPoints: user.points });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
);

// @route   GET /api/requests
// @desc    Get all public service requests (excludes direct offers)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find({ targetProviderId: { $exists: false } })
      .populate('userId', ['name', 'rating'])
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/requests/direct
// @desc    Get direct offers sent to the logged-in user
// @access  Private
router.get('/direct', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ targetProviderId: req.user.id, status: 'open' })
      .populate('userId', ['name', 'rating'])
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/requests/:id/cancel
// @desc    Cancel an open request and refund points
// @access  Private
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only the creator can cancel it
    if (request.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ success: false, message: `Cannot cancel a request that is ${request.status}` });
    }

    // Refund points
    const user = await User.findById(req.user.id);
    user.points += request.pointsOffered;
    await user.save();

    request.status = 'cancelled';
    await request.save();

    res.json({ success: true, message: 'Request cancelled and points refunded', request, newBalance: user.points });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/requests/:id/apply
// @desc    Apply for a public request
// @access  Private
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ success: false, message: `Cannot apply to a request that is ${request.status}` });
    }

    if (request.userId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own request' });
    }

    if (request.applicants.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have already applied to this request' });
    }

    request.applicants.push(req.user.id);
    await request.save();

    res.json({ success: true, message: 'Successfully applied to job', request });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/requests/my-requests
// @desc    Get all public requests created by the logged-in user, including applicants
// @access  Private
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ 
      userId: req.user.id, 
      targetProviderId: { $exists: false },
      status: 'open'
    })
      .populate('applicants', ['name', 'rating', 'skillsOffered'])
      .sort({ createdAt: -1 });
    
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;

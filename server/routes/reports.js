const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/reports
// @desc    Submit a report against a user
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { reportedUserId, reason, description } = req.body;

  if (!reportedUserId || !reason || !description) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  // Prevent self-reporting
  if (reportedUserId === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot report yourself' });
  }

  try {
    const newReport = new Report({
      reporterId: req.user.id,
      reportedUserId,
      reason,
      description
    });

    const report = await newReport.save();
    
    res.json({ success: true, message: 'Report submitted successfully. Our team will review it.', report });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/reports
// @desc    Get all reports (Admin only ideally, but keeping open for demo)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', ['name', 'email'])
      .populate('reportedUserId', ['name', 'email'])
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;

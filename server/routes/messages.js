const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/messages/:otherUserId
// @desc    Get conversation history with a specific user
// @access  Private
router.get('/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;

    // Fetch messages where current user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 }); // Sort chronologically (oldest first)

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/messages/conversations/all
// @desc    Get a list of users the current user is allowed to chat with (based on transactions)
// @access  Private
router.get('/conversations/all', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all valid transactions involving the user
    const transactions = await Transaction.find({
      $or: [{ requesterId: currentUserId }, { providerId: currentUserId }],
      status: { $in: ['in-progress', 'pending_confirmation', 'completed'] }
    });

    // Extract unique user IDs
    const userIds = new Set();
    transactions.forEach(t => {
      if (t.requesterId.toString() !== currentUserId) {
        userIds.add(t.requesterId.toString());
      }
      if (t.providerId.toString() !== currentUserId) {
        userIds.add(t.providerId.toString());
      }
    });

    // Fetch user details
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name email rating');

    res.json({ success: true, conversations: users });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;

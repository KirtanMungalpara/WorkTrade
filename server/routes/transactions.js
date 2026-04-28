const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Request = require('../models/Request');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// @route   POST /api/transactions/accept/:requestId
// @desc    Accept a service request
// @access  Private
router.post('/accept/:requestId', authMiddleware, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Check if this is a direct offer
    if (!request.targetProviderId) {
      return res.status(400).json({ success: false, message: 'This is a public request. Please apply for it instead.' });
    }

    if (request.targetProviderId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'This request was sent directly to someone else' });
    }

    if (request.userId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot accept your own request' });
    }

    // Change request status
    request.status = 'in-progress';
    await request.save();

    // Create a new transaction
    const newTransaction = new Transaction({
      requestId: request.id,
      requesterId: request.userId,
      providerId: req.user.id,
      points: request.pointsOffered,
      status: 'in-progress'
    });

    const transaction = await newTransaction.save();
    
    res.json({ success: true, message: 'Request accepted', transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/transactions/hire/:requestId/:providerId
// @desc    Hire a specific applicant for a public request
// @access  Private
router.post('/hire/:requestId/:providerId', authMiddleware, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Only the creator can hire someone
    if (request.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'You are not authorized to hire for this request' });
    }

    // Change request status
    request.status = 'in-progress';
    await request.save();

    // Create a new transaction
    const newTransaction = new Transaction({
      requestId: request.id,
      requesterId: request.userId,
      providerId: req.params.providerId,
      points: request.pointsOffered,
      status: 'in-progress'
    });

    const transaction = await newTransaction.save();
    
    res.json({ success: true, message: 'Provider hired successfully', transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/transactions/:id/proof
// @desc    Upload proof of work (by Provider)
// @access  Private
router.put('/:id/proof', authMiddleware, upload.array('proofImages', 3), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Ensure user is the provider
    if (transaction.providerId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (transaction.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: `Transaction is ${transaction.status}` });
    }

    let proofImages = [];
    if (req.files) {
      proofImages = req.files.map(file => file.path);
    }

    if (proofImages.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one proof image' });
    }

    transaction.proofImages = proofImages;
    transaction.status = 'pending_confirmation';
    await transaction.save();

    res.json({ success: true, message: 'Proof uploaded, waiting for requester confirmation', transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/transactions/:id/confirm
// @desc    Confirm transaction (only by Requester)
// @access  Private
router.put('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Ensure user is the requester
    const isRequester = transaction.requesterId.toString() === req.user.id;

    if (!isRequester) {
      return res.status(401).json({ success: false, message: 'Only the person who requested the job can confirm completion' });
    }

    if (transaction.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Transaction is already completed' });
    }

    transaction.requesterConfirmed = true;
    transaction.status = 'completed';
    
    // Find the original request and mark completed
    const request = await Request.findById(transaction.requestId);
    if (request) {
      request.status = 'completed';
      await request.save();
    }

    // Transfer points to provider
    const provider = await User.findById(transaction.providerId);
    provider.points += transaction.points;
    await provider.save();

    await transaction.save();
    return res.json({ success: true, message: 'Job confirmed! Transaction completed and points released.', transaction });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/transactions/my-active
// @desc    Get active transactions involving the logged-in user
// @access  Private
router.get('/my-active', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ requesterId: req.user.id }, { providerId: req.user.id }],
      status: { $in: ['in-progress', 'pending_confirmation'] }
    });
    res.json({ success: true, transactions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;

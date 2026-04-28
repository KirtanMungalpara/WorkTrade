const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'pending_confirmation', 'completed', 'disputed', 'cancelled'], 
    default: 'pending' 
  },
  requesterConfirmed: { type: Boolean, default: false },
  providerConfirmed: { type: Boolean, default: false },
  proofImages: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

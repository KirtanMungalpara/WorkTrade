const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  voiceUrl: { type: String },
  images: [{ type: String }],
  category: { type: String, required: true },
  pointsOffered: { type: Number, required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'completed', 'cancelled'], 
    default: 'open' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);

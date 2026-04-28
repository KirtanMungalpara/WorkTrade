const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skillsOffered: [{ type: String }],
  servicesNeeded: [{ type: String }],
  points: { type: Number, default: 100 },
  rating: { type: Number, default: 0 },
  location: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

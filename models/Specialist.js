const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String },
  availableSlots: [{ type: String }],
  bio: { type: String },
  initials: { type: String },
  rating: { type: Number },
  reviews: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Specialist', specialistSchema);

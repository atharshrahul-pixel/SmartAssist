const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  specialistId: { type: String, required: true },
  specialistName: { type: String },
  specialistCategory: { type: String },
  bookingDate: { type: String, required: true },
  bookingTime: { type: String, required: true },
  status: { type: String, default: 'confirmed' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

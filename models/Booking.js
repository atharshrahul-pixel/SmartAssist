const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  receiptId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  specialistId: { type: String, required: true },
  specialistName: { type: String },
  specialistCategory: { type: String },
  bookingDate: { type: String, required: true },
  bookingTime: { type: String, required: true },
  status: { type: String, default: 'confirmed' },
  rejectionReason: { type: String },
  rejectionReasonOther: { type: String },
  userId: { type: String },
  bookedFor: { type: String },
  appointmentMode: { type: String, default: 'In-Person' },
  price: { type: Number },
  duration: { type: String },
  triageUrgency: { type: String },
  triageExplanation: { type: String },
  triageHistory: [{
    role: { type: String },
    content: { type: String }
  }],
  triageKeywords: [{ type: String }],
  symptoms: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

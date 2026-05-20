const mongoose = require('mongoose');

const familyProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true }
});

const waitlistAppointmentSchema = new mongoose.Schema({
  specialistId: { type: String, required: true },
  specialistName: { type: String, required: true },
  bookingDate: { type: String, required: true },
  bookingTime: { type: String, required: true },
  status: { type: String, enum: ['pending', 'notified', 'claimed'], default: 'pending' },
  notifiedAt: { type: Date }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'specialist', 'admin'], default: 'user' },
  familyProfiles: [familyProfileSchema],
  waitlistAppointments: [waitlistAppointmentSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

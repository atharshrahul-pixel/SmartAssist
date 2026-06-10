const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String },
  availableSlots: [{ type: String }],
  bio: { type: String },
  initials: { type: String },
  rating: { type: Number, default: 5 },
  reviews: { type: Number, default: 0 },
  licenseNumber: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  clinicName: { type: String },
  address: { type: String },
  profilePhoto: { type: String },
  appointmentModes: {
    inPerson: {
      enabled: { type: Boolean, default: true },
      price: { type: Number, default: 100 },
      duration: { type: String, default: '30 mins' },
      slots: [{ type: String }]
    },
    video: {
      enabled: { type: Boolean, default: true },
      price: { type: Number, default: 60 },
      duration: { type: String, default: '20 mins' },
      slots: [{ type: String }]
    },
    chat: {
      enabled: { type: Boolean, default: true },
      price: { type: Number, default: 30 },
      duration: { type: String, default: '15 mins' },
      slots: [{ type: String }]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Specialist', specialistSchema);

const env = require('../config/env');
const Booking = require('../models/Booking');
const CustomError = require('../utils/customError');
const { getSpecialistById } = require('./specialistService');

const generateReceiptId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `SA-${timestamp}-${random}`.toUpperCase();
};

const createBooking = async ({ userName, userEmail, specialistId, bookingDate, bookingTime, rejectionReason, rejectionReasonOther, userId, bookedFor, appointmentMode, price, duration, triageUrgency, triageExplanation, triageHistory, triageKeywords, symptoms }) => {
  const specialist = await getSpecialistById(specialistId);

  if (!specialist) {
    throw new CustomError('Selected specialist was not found', 404);
  }

  const bookingData = {
    receiptId: generateReceiptId(),
    userName: userName.trim(),
    userEmail: userEmail.trim(),
    specialistId: specialist.id,
    specialistName: specialist.name,
    specialistCategory: specialist.category || specialist.specialization,
    bookingDate,
    bookingTime,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    rejectionReason,
    rejectionReasonOther,
    userId,
    bookedFor: bookedFor ? bookedFor.trim() : userName.trim(),
    appointmentMode: appointmentMode || 'In-Person',
    price,
    duration,
    triageUrgency,
    triageExplanation,
    triageHistory,
    triageKeywords,
    symptoms
  };

  const booking = await Booking.create(bookingData);

  if (userId) {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (user) {
      const waitlistEntry = user.waitlistAppointments.find(
        (w) => w.specialistId === specialist.id && w.bookingDate === bookingDate && w.bookingTime === bookingTime && w.status !== 'claimed'
      );
      if (waitlistEntry) {
        waitlistEntry.status = 'claimed';
        await user.save();
      }
    }
  }

  return { id: booking._id.toString(), ...bookingData };
};

module.exports = {
  createBooking,
};

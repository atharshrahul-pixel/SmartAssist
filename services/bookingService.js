const env = require('../config/env');
const Booking = require('../models/Booking');
const { bookings } = require('../data/mockData');
const CustomError = require('../utils/customError');
const { getSpecialistById } = require('./specialistService');

const createBooking = async ({ userName, specialistId, bookingDate, bookingTime }) => {
  const specialist = await getSpecialistById(specialistId);

  if (!specialist) {
    throw new CustomError('Selected specialist was not found', 404);
  }

  const bookingData = {
    userName: userName.trim(),
    specialistId: specialist.id,
    specialistName: specialist.name,
    specialistCategory: specialist.category,
    bookingDate,
    bookingTime,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const booking = await Booking.create(bookingData);
  return { id: booking._id.toString(), ...bookingData };
};

module.exports = {
  createBooking,
};

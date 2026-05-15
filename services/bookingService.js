const crypto = require('crypto');
const env = require('../config/env');
const { bookings } = require('../data/mockData');
const CustomError = require('../utils/customError');
const { getSpecialistById } = require('./specialistService');

let Booking;
let db;

if (env.dbProvider === 'mongodb') {
  Booking = require('../models/Booking');
} else {
  db = require('../config/firebase');
}

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

  if (env.dbProvider === 'mongodb') {
    const booking = await Booking.create(bookingData);
    return { id: booking._id.toString(), ...bookingData };
  } else {
    const booking = { id: crypto.randomUUID(), ...bookingData };
    bookings.push(booking);
    return booking;
  }
};

module.exports = {
  createBooking,
};

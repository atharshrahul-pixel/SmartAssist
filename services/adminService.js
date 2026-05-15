const Booking = require('../models/Booking');
const { SPECIALIST_CATEGORIES } = require('../constants/specialists');

const getAllBookings = async () => {
  return await Booking.find().sort({ createdAt: -1 });
};

module.exports = {
  getAllBookings
};

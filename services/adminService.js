const Booking = require('../models/Booking');

const getAllBookings = async () => {
  return await Booking.find().sort({ createdAt: -1 });
};

const deleteBooking = async (id) => {
  return await Booking.findByIdAndDelete(id);
};

module.exports = {
  getAllBookings,
  deleteBooking
};

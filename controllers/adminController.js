const { getAllBookings, deleteBooking } = require('../services/adminService');
const { reallocateSlot } = require('../services/waitlistService');
const env = require('../config/env');
const CustomError = require('../utils/customError');

const getDashboardData = async (req, res) => {
  const secretKey = req.headers['x-admin-secret'];
  if (!secretKey || secretKey !== process.env.SECRET_KEY) {
    throw new CustomError('Unauthorized', 403);
  }
  
  const bookings = await getAllBookings();
  res.status(200).json({ success: true, bookings });
};

const deleteBookingHandler = async (req, res) => {
  const secretKey = req.headers['x-admin-secret'];
  if (!secretKey || secretKey !== process.env.SECRET_KEY) {
    throw new CustomError('Unauthorized', 403);
  }

  const Booking = require('../models/Booking');
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw new CustomError('Booking not found', 404);
  }
  
  await deleteBooking(req.params.id);

  // Check waitlist and reallocate slot
  await reallocateSlot(booking.specialistId, booking.bookingDate, booking.bookingTime);
  
  res.status(200).json({ success: true, message: 'Booking deleted and waitlist updated' });
};

module.exports = { getDashboardData, deleteBookingHandler };

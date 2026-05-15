const { getAllBookings, deleteBooking } = require('../services/adminService');
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
  
  await deleteBooking(req.params.id);
  res.status(200).json({ success: true, message: 'Booking deleted' });
};

module.exports = { getDashboardData, deleteBookingHandler };

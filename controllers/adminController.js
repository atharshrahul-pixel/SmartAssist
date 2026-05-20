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

  const Booking = require('../models/Booking');
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw new CustomError('Booking not found', 404);
  }
  
  await deleteBooking(req.params.id);

  // Check waitlist
  const User = require('../models/User');
  const users = await User.find({
    'waitlistAppointments': {
      $elemMatch: {
        specialistId: booking.specialistId,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        status: 'pending'
      }
    }
  });

  if (users.length > 0) {
    let oldestUser = null;
    let oldestEntry = null;
    let oldestTime = Infinity;

    for (const u of users) {
      for (const entry of u.waitlistAppointments) {
        if (
          entry.specialistId === booking.specialistId &&
          entry.bookingDate === booking.bookingDate &&
          entry.bookingTime === booking.bookingTime &&
          entry.status === 'pending'
        ) {
          const t = new Date(entry.createdAt || entry.updatedAt || Date.now()).getTime();
          if (t < oldestTime) {
            oldestTime = t;
            oldestUser = u;
            oldestEntry = entry;
          }
        }
      }
    }

    if (oldestUser && oldestEntry) {
      oldestEntry.status = 'notified';
      oldestEntry.notifiedAt = new Date();
      await oldestUser.save();
    }
  }
  
  res.status(200).json({ success: true, message: 'Booking deleted and waitlist updated' });
};

module.exports = { getDashboardData, deleteBookingHandler };

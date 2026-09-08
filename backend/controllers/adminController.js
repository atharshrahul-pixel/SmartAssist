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

const getPendingSpecialists = async (req, res) => {
  const secretKey = req.headers['x-admin-secret'];
  if (!secretKey || secretKey !== process.env.SECRET_KEY) {
    throw new CustomError('Unauthorized', 403);
  }

  const Specialist = require('../models/Specialist');
  const pending = await Specialist.find({ status: 'pending' });
  res.status(200).json({ success: true, specialists: pending });
};

const approveSpecialist = async (req, res) => {
  const secretKey = req.headers['x-admin-secret'];
  if (!secretKey || secretKey !== process.env.SECRET_KEY) {
    throw new CustomError('Unauthorized', 403);
  }

  const Specialist = require('../models/Specialist');
  const specialist = await Specialist.findById(req.params.id);
  if (!specialist) {
    throw new CustomError('Specialist not found', 404);
  }

  specialist.status = 'approved';
  await specialist.save();

  const User = require('../models/User');
  const user = await User.findById(specialist.userId);
  const email = user ? user.email : 'unknown@example.com';
  const name = specialist.name || (user ? user.name : 'Doctor');

  const { sendSpecialistApprovalEmail } = require('../services/emailService');
  await sendSpecialistApprovalEmail(email, name);

  res.status(200).json({ success: true, message: 'Specialist approved successfully' });
};

const rejectSpecialist = async (req, res) => {
  const secretKey = req.headers['x-admin-secret'];
  if (!secretKey || secretKey !== process.env.SECRET_KEY) {
    throw new CustomError('Unauthorized', 403);
  }

  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    throw new CustomError('Please provide a reason for rejection', 400);
  }

  const Specialist = require('../models/Specialist');
  const specialist = await Specialist.findById(req.params.id);
  if (!specialist) {
    throw new CustomError('Specialist not found', 404);
  }

  specialist.status = 'rejected';
  specialist.rejectionReason = reason.trim();
  await specialist.save();

  const User = require('../models/User');
  const user = await User.findById(specialist.userId);
  const email = user ? user.email : 'unknown@example.com';
  const name = specialist.name || (user ? user.name : 'Doctor');

  console.log(`[Notification] Email sent to specialist ${email}: Application rejected. Reason: ${reason}`);

  const { sendSpecialistRejectionEmail } = require('../services/emailService');
  await sendSpecialistRejectionEmail(email, name, reason.trim());

  res.status(200).json({ success: true, message: 'Specialist application rejected' });
};

module.exports = { getDashboardData, deleteBookingHandler, getPendingSpecialists, approveSpecialist, rejectSpecialist };

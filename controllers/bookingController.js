const {
  createBooking
} = require("../services/bookingService");

const bookAppointment = async (req, res) => {
  try {
    const booking = await createBooking(req.body);
    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getOccupiedSlots = async (req, res) => {
  try {
    const { specialistId, bookingDate } = req.query;
    const Booking = require('../models/Booking');
    const occupied = await Booking.find({ specialistId, bookingDate, status: 'confirmed' });
    const slots = occupied.map(b => b.bookingTime);
    res.status(200).json({
      success: true,
      slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  bookAppointment,
  getUserBookings,
  getOccupiedSlots
};
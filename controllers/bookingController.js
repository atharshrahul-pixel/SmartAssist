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

const hasConcerningText = (text) => {
  if (!text) return false;
  const keywords = [
    'pain', 'blood', 'fever', 'breath', 'chest', 'dizzy', 'choke', 
    'vomit', 'bleeding', 'severe', 'heart', 'unconscious', 'emergency', 
    'critical', 'worst', 'worse', 'pressure', 'chills', 'swelling', 'numb'
  ];
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
};

const getBookingDateTime = (booking) => {
  try {
    return new Date(`${booking.bookingDate} ${booking.bookingTime}`);
  } catch {
    return new Date(0);
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { symptomImprovement, newSymptomsOrConcerns } = req.body;
    const { receiptId } = req.params;
    const Booking = require('../models/Booking');
    
    const booking = await Booking.findOne({ receiptId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check authorization
    if (booking.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const isMuchWorse = symptomImprovement === 1;
    const isConcerning = hasConcerningText(newSymptomsOrConcerns);
    const flagged = isMuchWorse || isConcerning;
    const reason = isMuchWorse 
      ? 'Much Worse improvement rating' 
      : (isConcerning ? 'Concerning keywords detected in feedback text' : undefined);
    
    booking.postVisitFeedback = {
      symptomImprovement,
      newSymptomsOrConcerns,
      submittedAt: new Date(),
      isFlagged: flagged,
      flagReason: reason
    };
    
    await booking.save();
    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPendingFeedback = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ userId: req.user._id.toString(), status: 'confirmed' });
    const now = new Date();
    
    const pending = bookings.filter(b => {
      // Check if feedback already submitted
      if (b.postVisitFeedback && b.postVisitFeedback.symptomImprovement) {
        return false;
      }
      const bDate = getBookingDateTime(b);
      if (isNaN(bDate.getTime())) return false;
      const diff = now - bDate;
      return diff > 24 * 60 * 60 * 1000; // 24 hours
    });
    
    res.status(200).json({ success: true, pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecoveryTimeline = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ 
      userId: req.user._id.toString(), 
      'postVisitFeedback.symptomImprovement': { $exists: true } 
    });
    
    // Sort chronologically (oldest first for graphing)
    const timeline = bookings.sort((a, b) => {
      const dateA = getBookingDateTime(a);
      const dateB = getBookingDateTime(b);
      return dateA - dateB;
    });
    
    res.status(200).json({ success: true, timeline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getUserBookings,
  getOccupiedSlots,
  submitFeedback,
  getPendingFeedback,
  getRecoveryTimeline
};
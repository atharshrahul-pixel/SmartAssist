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

const getRebookSuggestion = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ userId: req.user._id.toString(), status: 'confirmed' });
    
    const isPastBooking = (booking) => {
      try {
        const bDate = new Date(`${booking.bookingDate} ${booking.bookingTime}`);
        if (!isNaN(bDate.getTime())) {
          return bDate < new Date();
        }
        return false;
      } catch (e) {
        return false;
      }
    };
    
    const getBookingDateTime = (booking) => {
      try {
        return new Date(`${booking.bookingDate} ${booking.bookingTime}`);
      } catch {
        return new Date(0);
      }
    };

    const upcoming = bookings.filter(b => !isPastBooking(b));
    const sortedPast = bookings
      .filter(b => isPastBooking(b))
      .sort((a, b) => getBookingDateTime(b) - getBookingDateTime(a));
      
    if (sortedPast.length === 0) {
      return res.status(200).json({ success: true, rebookStatus: null });
    }
    
    const suggestionBooking = sortedPast.find(past => {
      const alreadyHasUpcoming = upcoming.some(up => 
        up.specialistId === past.specialistId || up.specialistCategory === past.specialistCategory
      );
      return !alreadyHasUpcoming;
    });
    
    if (!suggestionBooking) {
      return res.status(200).json({ success: true, rebookStatus: null });
    }
    
    const REBOOK_INTERVALS = {
      'Dentist': { days: 180, label: '6 months' },
      'Physiotherapist': { days: 14, label: '2 weeks' },
      'Gym Trainer': { days: 3, label: '3 days' },
      'Salon Specialist': { days: 30, label: '4 weeks' },
      'default': { days: 30, label: '1 month' }
    };
    
    const intervalConfig = REBOOK_INTERVALS[suggestionBooking.specialistCategory] || REBOOK_INTERVALS['default'];
    const bookingDate = getBookingDateTime(suggestionBooking);
    
    const now = new Date();
    const diffMs = now - bookingDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const recommendedDays = intervalConfig.days;
    const remainingDays = recommendedDays - diffDays;
    const isOverdue = remainingDays <= 0;
    
    let timeElapsedString = '';
    if (diffDays === 0) {
      timeElapsedString = 'today';
    } else if (diffDays === 1) {
      timeElapsedString = '1 day ago';
    } else if (diffDays < 7) {
      timeElapsedString = `${diffDays} days ago`;
    } else {
      const weeks = Math.floor(diffDays / 7);
      timeElapsedString = weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }
    
    res.status(200).json({
      success: true,
      rebookStatus: {
        booking: suggestionBooking,
        diffDays,
        remainingDays,
        timeElapsedString,
        isOverdue,
        recommendedLabel: intervalConfig.label
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rebookAppointmentDirect = async (req, res) => {
  try {
    const { specialistId, bookingDate, bookingTime, appointmentMode, price, duration, bookedFor } = req.body;
    
    if (!specialistId || !bookingDate || !bookingTime) {
      return res.status(400).json({ success: false, message: 'Please provide specialistId, bookingDate, and bookingTime' });
    }
    
    const booking = await createBooking({
      userName: req.user.name,
      userEmail: req.user.email,
      specialistId,
      bookingDate,
      bookingTime,
      userId: req.user._id.toString(),
      bookedFor: bookedFor || req.user.name,
      appointmentMode: appointmentMode || 'In-Person',
      price: price || 100,
      duration: duration || '30 mins',
      triageUrgency: 'Routine',
      triageExplanation: 'Direct follow-up booking skipping triage flow.',
      triageHistory: [],
      triageKeywords: [],
      symptoms: 'Follow-up session for past visit'
    });
    
    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingReceiptPDF = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const Booking = require('../models/Booking');
    const booking = await Booking.findOne({ receiptId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const { generateBookingReceiptPDF } = require('../services/pdfService');
    const pdfBuffer = await generateBookingReceiptPDF(booking);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${booking.receiptId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({ success: true, message: 'Appointment cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const undoCancelAppointment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (booking.status !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is not cancelled' });
    }

    const cancelledAtTime = booking.cancelledAt || booking.updatedAt;
    const diff = new Date() - new Date(cancelledAtTime);
    if (diff > 10 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'Undo window of 10 minutes has expired' });
    }

    booking.status = 'confirmed';
    booking.cancelledAt = undefined;
    await booking.save();

    res.status(200).json({ success: true, message: 'Cancellation undone successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
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
  getRecoveryTimeline,
  getRebookSuggestion,
  rebookAppointmentDirect,
  getBookingReceiptPDF,
  cancelAppointment,
  undoCancelAppointment,
  deleteAppointment
};
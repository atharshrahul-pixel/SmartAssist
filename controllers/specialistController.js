const {
  getSpecialists,
  createSpecialist,
  updateSpecialist,
  deleteSpecialist
} = require("../services/specialistService");

const listSpecialists = async (req, res) => {

  try {

    const specialists = await getSpecialists({
      category: req.query.category
    });

    res.status(200).json({
      success: true,
      count: specialists.length,
      specialists
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const addSpecialist = async (req, res) => {

  try {

    const specialist =
      await createSpecialist(req.body);

    res.status(201).json({
      success: true,
      specialist
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const editSpecialist = async (req, res) => {

  try {

    const specialist =
      await updateSpecialist(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      specialist
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const deleteSpecialistById = async (req, res) => {

  try {

    await deleteSpecialist(req.params.id);

    res.status(200).json({
      success: true,
      message: "Specialist deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const rateSpecialist = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const specialistId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5"
      });
    }

    const Specialist = require("../models/Specialist");
    const specialist = await Specialist.findById(specialistId);
    if (!specialist) {
      return res.status(404).json({
        success: false,
        message: "Specialist not found"
      });
    }

    const currentRating = specialist.rating || 0;
    const currentReviews = specialist.reviews || 0;

    const newReviews = currentReviews + 1;
    const newRating = ((currentRating * currentReviews) + Number(rating)) / newReviews;

    specialist.rating = Math.round(newRating * 10) / 10;
    specialist.reviews = newReviews;
    await specialist.save();

    res.status(200).json({
      success: true,
      specialist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMyProfile = async (req, res) => {
  let specialist = req.specialist;
  if (!specialist) {
    const Specialist = require("../models/Specialist");
    specialist = await Specialist.findOne({ userId: req.user._id });
  }
  res.status(200).json({
    success: true,
    specialist
  });
};

const updateMyProfile = async (req, res) => {
  const { bio, clinicName, experience, profilePhoto } = req.body;

  if (profilePhoto && profilePhoto.length > 1.5 * 1024 * 1024) {
    throw new CustomError('Profile photo size exceeds 1MB limit', 400);
  }

  const specialist = req.specialist;

  if (bio !== undefined) specialist.bio = bio;
  if (clinicName !== undefined) specialist.clinicName = clinicName;
  if (experience !== undefined) {
    const expStr = experience.toString().toLowerCase();
    specialist.experience = expStr.endsWith('years') || expStr.endsWith('year') ? experience : `${experience} years`;
  }
  if (profilePhoto !== undefined) specialist.profilePhoto = profilePhoto;

  await specialist.save();
  res.status(200).json({ success: true, specialist });
};

const updateMySlots = async (req, res) => {
  const { slots } = req.body;
  if (!Array.isArray(slots)) {
    throw new CustomError('Slots must be an array of time strings', 400);
  }

  const specialist = req.specialist;
  specialist.availableSlots = slots;
  await specialist.save();

  res.status(200).json({ success: true, specialist });
};

const updateMyModes = async (req, res) => {
  const { appointmentModes } = req.body;
  if (!appointmentModes) {
    throw new CustomError('Missing appointmentModes configs', 400);
  }

  const specialist = req.specialist;

  if (appointmentModes.inPerson) {
    specialist.appointmentModes.inPerson = {
      ...specialist.appointmentModes.inPerson,
      ...appointmentModes.inPerson
    };
  }
  if (appointmentModes.video) {
    specialist.appointmentModes.video = {
      ...specialist.appointmentModes.video,
      ...appointmentModes.video
    };
  }
  if (appointmentModes.chat) {
    specialist.appointmentModes.chat = {
      ...specialist.appointmentModes.chat,
      ...appointmentModes.chat
    };
  }

  await specialist.save();
  res.status(200).json({ success: true, specialist });
};

const getMyAppointments = async (req, res) => {
  const Booking = require('../models/Booking');
  const appointments = await Booking.find({ specialistId: req.specialist._id.toString() }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, appointments });
};

const getPatientSummary = async (req, res) => {
  const Booking = require('../models/Booking');
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    specialistId: req.specialist._id.toString()
  });

  if (!booking) {
    const CustomError = require('../utils/customError');
    throw new CustomError('Booking not found', 404);
  }

  res.status(200).json({
    success: true,
    summary: {
      _id: booking._id,
      receiptId: booking.receiptId,
      patientName: booking.bookedFor || booking.userName,
      patientEmail: booking.userEmail,
      appointmentMode: booking.appointmentMode,
      date: booking.bookingDate,
      time: booking.bookingTime,
      rejectionReason: booking.rejectionReason,
      rejectionReasonOther: booking.rejectionReasonOther,
      symptoms: booking.symptoms,
      triageUrgency: booking.triageUrgency,
      triageExplanation: booking.triageExplanation,
      triageHistory: booking.triageHistory,
      triageKeywords: booking.triageKeywords
    }
  });
};

const getMyEarnings = async (req, res) => {
  const Booking = require('../models/Booking');
  
  // TODO: cache or materialize earnings if volume grows large
  const confirmedBookings = await Booking.find({
    specialistId: req.specialist._id.toString(),
    status: 'confirmed'
  });

  const bookingsList = confirmedBookings.map(b => ({
    bookingId: b._id,
    receiptId: b.receiptId,
    patientName: b.bookedFor || b.userName,
    date: b.bookingDate,
    time: b.bookingTime,
    amount: b.price || 0,
    mode: b.appointmentMode
  }));

  const totalEarnings = bookingsList.reduce((sum, b) => sum + b.amount, 0);

  res.status(200).json({
    success: true,
    totalEarnings,
    earningsList: bookingsList
  });
};

const getPatientSummaryPDF = async (req, res) => {
  const Booking = require('../models/Booking');
  const User = require('../models/User');
  const { generatePreVisitSummaryPDF } = require('../services/pdfService');

  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    specialistId: req.specialist._id.toString()
  });

  if (!booking) {
    const CustomError = require('../utils/customError');
    throw new CustomError('Booking not found or unauthorized', 404);
  }

  let userProfile = null;
  if (booking.userId) {
    userProfile = await User.findById(booking.userId);
  }

  const pdfBuffer = await generatePreVisitSummaryPDF(booking, userProfile);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=summary-${booking.receiptId}.pdf`);
  res.send(pdfBuffer);
};

module.exports = {
  listSpecialists,
  addSpecialist,
  editSpecialist,
  deleteSpecialistById,
  rateSpecialist,
  getMyProfile,
  updateMyProfile,
  updateMySlots,
  updateMyModes,
  getMyAppointments,
  getPatientSummary,
  getPatientSummaryPDF,
  getMyEarnings
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const CustomError = require('../utils/customError');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '7d' });
};

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new CustomError('Please provide all required fields', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new CustomError('User with this email already exists', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: role || 'user',
    familyProfiles: [],
    waitlistAppointments: []
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      familyProfiles: user.familyProfiles,
      waitlistAppointments: user.waitlistAppointments
    }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError('Please provide email and password', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new CustomError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new CustomError('Invalid credentials', 401);
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      familyProfiles: user.familyProfiles,
      waitlistAppointments: user.waitlistAppointments
    }
  });
};

const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      familyProfiles: req.user.familyProfiles,
      waitlistAppointments: req.user.waitlistAppointments
    }
  });
};

const addFamilyMember = async (req, res) => {
  const { name, relationship } = req.body;

  if (!name || !relationship) {
    throw new CustomError('Please provide family member name and relationship', 400);
  }

  req.user.familyProfiles.push({ name, relationship });
  await req.user.save();

  res.status(200).json({
    success: true,
    familyProfiles: req.user.familyProfiles
  });
};

const deleteFamilyMember = async (req, res) => {
  const { memberId } = req.params;

  req.user.familyProfiles = req.user.familyProfiles.filter(
    (member) => member._id.toString() !== memberId
  );
  await req.user.save();

  res.status(200).json({
    success: true,
    familyProfiles: req.user.familyProfiles
  });
};

const joinWaitlist = async (req, res) => {
  const { specialistId, specialistName, bookingDate, bookingTime } = req.body;

  if (!specialistId || !specialistName || !bookingDate || !bookingTime) {
    throw new CustomError('Missing waitlist appointment details', 400);
  }

  // Check if already waitlisted for this specific slot
  const isAlreadyWaitlisted = req.user.waitlistAppointments.some(
    (w) => w.specialistId === specialistId && w.bookingDate === bookingDate && w.bookingTime === bookingTime && w.status !== 'claimed'
  );

  if (isAlreadyWaitlisted) {
    throw new CustomError('You are already on the waitlist for this slot', 400);
  }

  req.user.waitlistAppointments.push({
    specialistId,
    specialistName,
    bookingDate,
    bookingTime,
    status: 'pending'
  });
  await req.user.save();

  res.status(200).json({
    success: true,
    waitlistAppointments: req.user.waitlistAppointments
  });
};

const claimWaitlistSlot = async (req, res) => {
  const { waitlistId } = req.body;

  const waitlistEntry = req.user.waitlistAppointments.id(waitlistId);
  if (!waitlistEntry) {
    throw new CustomError('Waitlist entry not found', 404);
  }

  if (waitlistEntry.status !== 'notified') {
    throw new CustomError('Slot is not notified for booking', 400);
  }

  waitlistEntry.status = 'claimed';
  await req.user.save();

  res.status(200).json({
    success: true,
    waitlistAppointments: req.user.waitlistAppointments
  });
};

module.exports = {
  register,
  login,
  getProfile,
  addFamilyMember,
  deleteFamilyMember,
  joinWaitlist,
  claimWaitlistSlot
};

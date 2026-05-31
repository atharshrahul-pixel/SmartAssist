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
      waitlistAppointments: user.waitlistAppointments,
      notificationPreferences: user.notificationPreferences
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

  let specialistStatus = null;
  let rejectionReason = null;
  if (user.role === 'specialist') {
    const Specialist = require('../models/Specialist');
    const specialist = await Specialist.findOne({ userId: user._id });
    if (specialist) {
      specialistStatus = specialist.status;
      rejectionReason = specialist.rejectionReason;

      if (specialistStatus === 'pending' || specialistStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          status: specialistStatus,
          rejectionReason,
          message: specialistStatus === 'pending'
            ? 'Your application is under review.'
            : `Your application was rejected: ${rejectionReason}`,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            familyProfiles: user.familyProfiles,
            waitlistAppointments: user.waitlistAppointments,
            notificationPreferences: user.notificationPreferences
          }
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    token,
    specialistStatus,
    rejectionReason,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      familyProfiles: user.familyProfiles,
      waitlistAppointments: user.waitlistAppointments,
      notificationPreferences: user.notificationPreferences
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
      waitlistAppointments: req.user.waitlistAppointments,
      notificationPreferences: req.user.notificationPreferences
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

const registerSpecialist = async (req, res) => {
  const { name, email, password, specialization, experience, clinicName, licenseNumber, bio, profilePhoto } = req.body;

  if (!name || !email || !password || !specialization || !licenseNumber) {
    throw new CustomError('Please provide all required fields', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new CustomError('User with this email already exists', 400);
  }

  const Specialist = require('../models/Specialist');
  const existingSpecialist = await Specialist.findOne({ licenseNumber: licenseNumber.trim() });
  if (existingSpecialist) {
    throw new CustomError('Specialist with this license number already exists', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: 'specialist',
    familyProfiles: [],
    waitlistAppointments: []
  });

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();

  const specialist = await Specialist.create({
    userId: user._id,
    name,
    specialization,
    experience: experience ? (experience.toString().toLowerCase().endsWith('years') || experience.toString().toLowerCase().endsWith('year') ? experience : `${experience} years`) : '1 year',
    clinicName: clinicName || '',
    licenseNumber: licenseNumber.trim(),
    bio: bio || '',
    profilePhoto: profilePhoto || '',
    initials,
    status: 'pending',
    availableSlots: [],
    appointmentModes: {
      inPerson: { enabled: true, price: 100, duration: '30 mins', slots: [] },
      video: { enabled: true, price: 60, duration: '20 mins', slots: [] },
      chat: { enabled: true, price: 30, duration: '15 mins', slots: [] }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Application is under review by administrator.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

const reapplySpecialist = async (req, res) => {
  if (req.user.role !== 'specialist') {
    throw new CustomError('Access denied. Specialist account required.', 403);
  }

  const { name, specialization, experience, clinicName, bio, profilePhoto } = req.body;

  const Specialist = require('../models/Specialist');
  const specialist = await Specialist.findOne({ userId: req.user._id });
  if (!specialist) {
    throw new CustomError('Specialist profile not found.', 404);
  }

  if (specialist.status !== 'rejected') {
    throw new CustomError('You can only reapply if your application was rejected.', 400);
  }

  if (name && name.trim()) {
    req.user.name = name.trim();
    await req.user.save();
    specialist.name = name.trim();
  }

  if (specialization) specialist.specialization = specialization;
  if (experience) {
    const expStr = experience.toString().toLowerCase();
    specialist.experience = expStr.endsWith('years') || expStr.endsWith('year') ? experience : `${experience} years`;
  }
  if (clinicName !== undefined) specialist.clinicName = clinicName;
  if (bio !== undefined) specialist.bio = bio;
  if (profilePhoto !== undefined) specialist.profilePhoto = profilePhoto;

  specialist.status = 'pending';
  specialist.rejectionReason = undefined;
  await specialist.save();

  res.status(200).json({
    success: true,
    message: 'Reapplication submitted successfully. Application is under review.',
    specialist
  });
};

const updatePreferences = async (req, res) => {
  const { email, sms } = req.body;
  if (!req.user.notificationPreferences) {
    req.user.notificationPreferences = { email: true, sms: true };
  }
  if (email !== undefined) req.user.notificationPreferences.email = !!email;
  if (sms !== undefined) req.user.notificationPreferences.sms = !!sms;
  await req.user.save();
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      familyProfiles: req.user.familyProfiles,
      waitlistAppointments: req.user.waitlistAppointments,
      notificationPreferences: req.user.notificationPreferences
    }
  });
};

module.exports = {
  register,
  login,
  getProfile,
  addFamilyMember,
  deleteFamilyMember,
  joinWaitlist,
  claimWaitlistSlot,
  registerSpecialist,
  reapplySpecialist,
  updatePreferences
};

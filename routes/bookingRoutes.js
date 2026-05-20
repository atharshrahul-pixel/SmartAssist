const express = require('express');

const {
  bookAppointment,
  getUserBookings,
  getOccupiedSlots
} = require('../controllers/bookingController');

const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/',
  asyncHandler(bookAppointment)
);

router.get(
  '/user',
  authMiddleware,
  asyncHandler(getUserBookings)
);

router.get(
  '/occupied',
  asyncHandler(getOccupiedSlots)
);

module.exports = router;
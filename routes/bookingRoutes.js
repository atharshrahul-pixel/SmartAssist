const express = require('express');

const {
  bookAppointment
} = require('../controllers/bookingController');

const asyncHandler =
  require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/',
  asyncHandler(bookAppointment)
);

module.exports = router;
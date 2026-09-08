const express = require('express');
const { lookupBooking } = require('../controllers/lookupController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/:query', asyncHandler(lookupBooking));

module.exports = router;

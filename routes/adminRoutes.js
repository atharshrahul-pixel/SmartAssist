const express = require('express');
const { getDashboardData, deleteBookingHandler } = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/dashboard', asyncHandler(getDashboardData));
router.delete('/dashboard/:id', asyncHandler(deleteBookingHandler));

module.exports = router;

const express = require('express');
const { getDashboardData, deleteBookingHandler, getPendingSpecialists, approveSpecialist, rejectSpecialist } = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/dashboard', asyncHandler(getDashboardData));
router.delete('/dashboard/:id', asyncHandler(deleteBookingHandler));
router.get('/dashboard/specialists/pending', asyncHandler(getPendingSpecialists));
router.post('/dashboard/specialists/:id/approve', asyncHandler(approveSpecialist));
router.post('/dashboard/specialists/:id/reject', asyncHandler(rejectSpecialist));

module.exports = router;

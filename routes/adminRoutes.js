const express = require('express');
const { getDashboardData } = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/dashboard', asyncHandler(getDashboardData));

module.exports = router;

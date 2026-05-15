const express = require('express');
const { recommendSpecialist } = require('../controllers/recommendationController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/recommend', asyncHandler(recommendSpecialist));

module.exports = router;

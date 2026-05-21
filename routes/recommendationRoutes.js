const express = require('express');
const { recommendSpecialist, triageConversation } = require('../controllers/recommendationController');
const triageRateLimiter = require('../middleware/triageRateLimiter');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/recommend', asyncHandler(recommendSpecialist));
router.post('/triage', triageRateLimiter, asyncHandler(triageConversation));

module.exports = router;

const express = require('express');
const multer = require('multer');
const { recommendSpecialist, triageConversation, transcribeAudio } = require('../controllers/recommendationController');
const triageRateLimiter = require('../middleware/triageRateLimiter');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/recommend', asyncHandler(recommendSpecialist));
router.post('/triage', triageRateLimiter, asyncHandler(triageConversation));
router.post('/transcribe', upload.single('audio'), asyncHandler(transcribeAudio));

module.exports = router;

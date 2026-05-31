const express = require('express');
const {
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
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/register/specialist', asyncHandler(registerSpecialist));
router.post('/login', asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(getProfile));
router.post('/family', authMiddleware, asyncHandler(addFamilyMember));
router.delete('/family/:memberId', authMiddleware, asyncHandler(deleteFamilyMember));
router.post('/waitlist', authMiddleware, asyncHandler(joinWaitlist));
router.post('/waitlist/claim', authMiddleware, asyncHandler(claimWaitlistSlot));
router.post('/reapply/specialist', authMiddleware, asyncHandler(reapplySpecialist));
router.put('/preferences', authMiddleware, asyncHandler(updatePreferences));

module.exports = router;

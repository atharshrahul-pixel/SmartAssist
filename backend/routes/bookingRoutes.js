const express = require('express');

const {
  bookAppointment,
  getUserBookings,
  getOccupiedSlots,
  submitFeedback,
  getPendingFeedback,
  getRecoveryTimeline,
  getRebookSuggestion,
  rebookAppointmentDirect,
  getBookingReceiptPDF,
  cancelAppointment,
  undoCancelAppointment,
  deleteAppointment,
  sendBookingConfirmationEmailController
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

router.get(
  '/pending-feedback',
  authMiddleware,
  asyncHandler(getPendingFeedback)
);

router.get(
  '/recovery-timeline',
  authMiddleware,
  asyncHandler(getRecoveryTimeline)
);

router.get(
  '/rebook-suggestion',
  authMiddleware,
  asyncHandler(getRebookSuggestion)
);

router.post(
  '/rebook',
  authMiddleware,
  asyncHandler(rebookAppointmentDirect)
);

router.post(
  '/:receiptId/feedback',
  authMiddleware,
  asyncHandler(submitFeedback)
);

router.get(
  '/:receiptId/pdf',
  asyncHandler(getBookingReceiptPDF)
);

router.post(
  '/:bookingId/cancel',
  authMiddleware,
  asyncHandler(cancelAppointment)
);

router.post(
  '/:bookingId/undo-cancel',
  authMiddleware,
  asyncHandler(undoCancelAppointment)
);

router.delete(
  '/:bookingId',
  authMiddleware,
  asyncHandler(deleteAppointment)
);

router.post(
  '/:receiptId/send-email',
  asyncHandler(sendBookingConfirmationEmailController)
);

module.exports = router;
const express = require("express");

const router = express.Router();

const {
  listSpecialists,
  addSpecialist,
  editSpecialist,
  deleteSpecialistById,
  rateSpecialist,
  getMyProfile,
  updateMyProfile,
  updateMySlots,
  updateMyModes,
  getMyAppointments,
  getPatientSummary,
  getPatientSummaryPDF,
  getMyEarnings,
  geocodeAddress,
  reverseGeocode
} = require("../controllers/specialistController");

const authMiddleware = require("../middleware/authMiddleware");
const { requireApprovedSpecialist } = require("../middleware/specialistMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", listSpecialists);
router.post("/geocode", asyncHandler(geocodeAddress));
router.post("/reverse-geocode", asyncHandler(reverseGeocode));
router.patch("/:id", editSpecialist);
router.delete("/:id", deleteSpecialistById);
router.post("/", addSpecialist);
router.post("/:id/rate", authMiddleware, rateSpecialist);

// Dashboard routes for approved specialists
router.get("/my/profile", authMiddleware, asyncHandler(getMyProfile));
router.put("/my/profile", authMiddleware, requireApprovedSpecialist, asyncHandler(updateMyProfile));
router.put("/my/slots", authMiddleware, requireApprovedSpecialist, asyncHandler(updateMySlots));
router.put("/my/modes", authMiddleware, requireApprovedSpecialist, asyncHandler(updateMyModes));
router.get("/my/appointments", authMiddleware, requireApprovedSpecialist, asyncHandler(getMyAppointments));
router.get("/my/appointments/:bookingId/summary", authMiddleware, requireApprovedSpecialist, asyncHandler(getPatientSummary));
router.get("/my/appointments/:bookingId/summary/pdf", authMiddleware, requireApprovedSpecialist, asyncHandler(getPatientSummaryPDF));
router.get("/my/earnings", authMiddleware, requireApprovedSpecialist, asyncHandler(getMyEarnings));

module.exports = router;
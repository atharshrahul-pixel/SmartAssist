const express = require("express");

const router = express.Router();

const {
  listSpecialists,
  addSpecialist,
  editSpecialist,
  deleteSpecialistById,
  rateSpecialist
} = require("../controllers/specialistController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", listSpecialists);

router.patch("/:id", editSpecialist);

router.delete("/:id", deleteSpecialistById);

router.post("/", addSpecialist);

router.post("/:id/rate", authMiddleware, rateSpecialist);

module.exports = router;
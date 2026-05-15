const express = require("express");

const router = express.Router();

const {
  listSpecialists,
  addSpecialist,
  editSpecialist,
  deleteSpecialistById
} = require("../controllers/specialistController");

router.get("/", listSpecialists);

router.patch("/:id", editSpecialist);

router.delete("/:id", deleteSpecialistById);

router.post("/", addSpecialist);

module.exports = router;
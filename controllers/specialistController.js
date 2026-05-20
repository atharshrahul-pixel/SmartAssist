const {
  getSpecialists,
  createSpecialist,
  updateSpecialist,
  deleteSpecialist
} = require("../services/specialistService");

const listSpecialists = async (req, res) => {

  try {

    const specialists = await getSpecialists({
      category: req.query.category
    });

    res.status(200).json({
      success: true,
      count: specialists.length,
      specialists
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const addSpecialist = async (req, res) => {

  try {

    const specialist =
      await createSpecialist(req.body);

    res.status(201).json({
      success: true,
      specialist
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const editSpecialist = async (req, res) => {

  try {

    const specialist =
      await updateSpecialist(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      specialist
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const deleteSpecialistById = async (req, res) => {

  try {

    await deleteSpecialist(req.params.id);

    res.status(200).json({
      success: true,
      message: "Specialist deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const rateSpecialist = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const specialistId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5"
      });
    }

    const Specialist = require("../models/Specialist");
    const specialist = await Specialist.findById(specialistId);
    if (!specialist) {
      return res.status(404).json({
        success: false,
        message: "Specialist not found"
      });
    }

    const currentRating = specialist.rating || 0;
    const currentReviews = specialist.reviews || 0;

    const newReviews = currentReviews + 1;
    const newRating = ((currentRating * currentReviews) + Number(rating)) / newReviews;

    specialist.rating = Math.round(newRating * 10) / 10;
    specialist.reviews = newReviews;
    await specialist.save();

    res.status(200).json({
      success: true,
      specialist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  listSpecialists,
  addSpecialist,
  editSpecialist,
  deleteSpecialistById,
  rateSpecialist
};
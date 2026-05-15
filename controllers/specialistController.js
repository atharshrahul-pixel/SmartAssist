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

module.exports = {
  listSpecialists,
  addSpecialist,
  editSpecialist,
  deleteSpecialistById
};
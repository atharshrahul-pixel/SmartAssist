const {
  createBooking
} = require("../services/bookingService");

const bookAppointment = async (req, res) => {
  try {
    const booking = await createBooking(req.body);
    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  bookAppointment
};
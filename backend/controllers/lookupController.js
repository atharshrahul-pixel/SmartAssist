const { findBookings } = require('../services/lookupService');

const lookupBooking = async (req, res) => {
  const { query } = req.params;
  const bookings = await findBookings(query);
  
  if (!bookings || bookings.length === 0) {
    return res.status(404).json({ success: false, message: 'No appointments found' });
  }

  res.status(200).json({ success: true, bookings });
};

module.exports = { lookupBooking };

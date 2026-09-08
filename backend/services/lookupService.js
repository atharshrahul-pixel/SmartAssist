const Booking = require('../models/Booking');

const findBookings = async (queryParam) => {
  // Try searching by receiptId or userEmail
  return await Booking.find({
    $or: [
      { receiptId: queryParam },
      { userEmail: queryParam }
    ]
  }).sort({ createdAt: -1 });
};

module.exports = { findBookings };

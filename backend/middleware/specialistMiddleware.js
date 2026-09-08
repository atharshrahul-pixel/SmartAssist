const Specialist = require('../models/Specialist');
const CustomError = require('../utils/customError');

const requireApprovedSpecialist = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (req.user.role !== 'specialist') {
      throw new CustomError('Access denied. Specialist account required.', 403);
    }

    const specialist = await Specialist.findOne({ userId: req.user._id });
    if (!specialist) {
      throw new CustomError('Specialist profile not found.', 404);
    }

    if (specialist.status !== 'approved') {
      throw new CustomError(`Access denied. Specialist profile status is ${specialist.status}.`, 403);
    }

    req.specialist = specialist;
    next();
  } catch (err) {
    next(err);
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (req.user.role !== 'admin') {
      throw new CustomError('Access denied. Administrator privileges required.', 403);
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requireApprovedSpecialist,
  requireAdmin
};

const env = require('../config/env');
const CustomError = require('../utils/customError');

const restrictOrigin = (req, res, next) => {
  const origin = req.get('Origin');

  // Skip check in development if needed, or enforce strictly
  if (env.nodeEnv === 'development' && !origin) {
    return next();
  }

  // Allow only requests from our frontend
  if (origin && origin === env.frontendUrl) {
    return next();
  }

  // Deny all other origins
  throw new CustomError('Access denied: Unauthorized origin', 403);
};

module.exports = {
  restrictOrigin,
};

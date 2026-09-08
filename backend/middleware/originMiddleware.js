const env = require('../config/env');
const CustomError = require('../utils/customError');

const restrictOrigin = (req, res, next) => {
  const origin = req.get('Origin');

  // Allow tool requests, server-to-server, or test scripts
  if (!origin) {
    return next();
  }

  const allowedOrigins = [
    env.frontendUrl,
    'https://smart-assist-frontend-one.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
  ]
    .filter(Boolean)
    .map((o) => o.replace(/\/+$/, ''));

  const normalizedOrigin = origin.replace(/\/+$/, '');

  // Allow requests from our frontend or local development hosts
  if (allowedOrigins.includes(normalizedOrigin)) {
    return next();
  }

  // Deny all other origins
  throw new CustomError(`Access denied: Unauthorized origin (${origin})`, 403);
};

module.exports = {
  restrictOrigin,
};

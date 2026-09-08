const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const CustomError = require('../utils/customError');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Authorization token required', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      throw new CustomError('Invalid or expired token', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new CustomError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;

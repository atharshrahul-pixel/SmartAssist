const mongoose = require('mongoose');
const env = require('./env');

const connectDb = async () => {
  if (env.dbProvider !== 'mongodb') return;

  if (!env.mongoDbUri) {
    console.error('MongoDB URI is missing in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(env.mongoDbUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDb;

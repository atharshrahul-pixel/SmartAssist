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

    try {
      const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
      if (collections.length > 0) {
        const indexes = await mongoose.connection.db.collection('users').indexes();
        const hasUserIdIndex = indexes.some(idx => idx.name === 'userId_1');
        if (hasUserIdIndex) {
          await mongoose.connection.db.collection('users').dropIndex('userId_1');
          console.log('Successfully dropped legacy unique index "userId_1" from users collection.');
        }
      }
    } catch (err) {
      console.warn('Could not check or drop legacy users index:', err.message);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDb;

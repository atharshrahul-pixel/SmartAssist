const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const connectDb = require('./config/mongodb');

const recommendationRoutes = require('./routes/recommendationRoutes');
const specialistRoutes = require('./routes/specialistRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const lookupRoutes = require('./routes/lookupRoutes');
const authRoutes = require('./routes/authRoutes');

const {
  errorMiddleware,
  notFoundMiddleware
} = require('./middleware/errorMiddleware');
const { restrictOrigin } = require('./middleware/originMiddleware');

const app = express();

connectDb();

const allowedOrigins = [
  env.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartAssist backend is running',
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use('/api', restrictOrigin);

app.use('/api/auth', authRoutes);

app.use('/api/recommendations', recommendationRoutes);
app.use('/api/recommendation', recommendationRoutes);

app.use('/api/specialists', specialistRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/lookup', lookupRoutes);

/*
|--------------------------------------------------------------------------
| Error Handling
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

app.use(errorMiddleware);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(env.port, () => {
  console.log(
    `SmartAssist backend running on http://localhost:${env.port}`
  );
  
  // Start background task checking for expired waitlist holds
  const { checkExpiredWaitlistHolds } = require('./services/waitlistService');
  // Check every 30 seconds
  setInterval(checkExpiredWaitlistHolds, 30000);

  // Smart Reminders Background Worker using node-cron (runs every minute)
  const cron = require('node-cron');
  const { runNotificationCheck } = require('./services/notificationService');
  cron.schedule('* * * * *', () => {
    runNotificationCheck();
  });
});

module.exports = app;
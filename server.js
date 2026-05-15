const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const connectDb = require('./config/mongodb');

const recommendationRoutes = require('./routes/recommendationRoutes');
const specialistRoutes = require('./routes/specialistRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const {
  errorMiddleware,
  notFoundMiddleware
} = require('./middleware/errorMiddleware');

const app = express();

connectDb();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: '20kb' }));

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

app.use('/api/recommendations', recommendationRoutes);

app.use('/api/specialists', specialistRoutes);

app.use('/api/bookings', bookingRoutes);

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
});

module.exports = app;
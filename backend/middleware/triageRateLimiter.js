const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const rateLimitMaxRequests = 20;
const ipRequestHistory = new Map();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, history] of ipRequestHistory.entries()) {
    const validHistory = history.filter(timestamp => now - timestamp < rateLimitWindowMs);
    if (validHistory.length === 0) {
      ipRequestHistory.delete(ip);
    } else {
      ipRequestHistory.set(ip, validHistory);
    }
  }
}, 5 * 60 * 1000); // every 5 minutes

const triageRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' || process.env.DISABLE_RATE_LIMIT === 'true') {
    return next();
  }

  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  let history = ipRequestHistory.get(ip) || [];
  history = history.filter(timestamp => now - timestamp < rateLimitWindowMs);

  if (history.length >= rateLimitMaxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many triage requests from this IP. Please try again after 15 minutes.'
    });
  }

  history.push(now);
  ipRequestHistory.set(ip, history);
  next();
};

module.exports = triageRateLimiter;

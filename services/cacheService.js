const Redis = require('ioredis');
const NodeCache = require('node-cache');

let redisClient = null;
const localCache = new NodeCache({ stdTTL: 21600, checkperiod: 120 }); // default 6h TTL
let useLocalOnly = false;

// Statistics counters
let cacheHits = 0;
let cacheMisses = 0;

if (process.env.REDIS_URL) {
  try {
    const redisOptions = {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      reconnectOnError: () => true
    };
    if (process.env.REDIS_PASSWORD) {
      redisOptions.password = process.env.REDIS_PASSWORD;
    }
    redisClient = new Redis(process.env.REDIS_URL, redisOptions);

    redisClient.on('error', (err) => {
      console.warn('Redis client error, falling back to local memory cache:', err.message);
      useLocalOnly = true;
    });

    redisClient.on('connect', () => {
      console.log('Redis cache connected successfully.');
      useLocalOnly = false;
    });
  } catch (err) {
    console.error('Failed to initialize Redis client:', err.message);
    useLocalOnly = true;
  }
} else {
  console.log('REDIS_URL not configured. Using local in-memory cache.');
  useLocalOnly = true;
}

const get = async (key) => {
  if (!useLocalOnly && redisClient && redisClient.status === 'ready') {
    try {
      const val = await redisClient.get(key);
      if (val !== null) {
        cacheHits++;
        console.log(`[Cache Hit] Redis: ${key}`);
        return JSON.parse(val);
      }
    } catch (err) {
      console.warn(`Redis get failed for key ${key}:`, err.message);
    }
  }

  const val = localCache.get(key);
  if (val !== undefined) {
    cacheHits++;
    console.log(`[Cache Hit] Local: ${key}`);
    return val;
  }

  cacheMisses++;
  console.log(`[Cache Miss]: ${key}`);
  return null;
};

const set = async (key, value, ttlSeconds) => {
  const serialized = JSON.stringify(value);
  if (!useLocalOnly && redisClient && redisClient.status === 'ready') {
    try {
      if (ttlSeconds) {
        await redisClient.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await redisClient.set(key, serialized);
      }
    } catch (err) {
      console.warn(`Redis set failed for key ${key}:`, err.message);
    }
  }

  if (ttlSeconds) {
    localCache.set(key, value, ttlSeconds);
  } else {
    localCache.set(key, value);
  }
};

const increment = async (key) => {
  if (!useLocalOnly && redisClient && redisClient.status === 'ready') {
    try {
      return await redisClient.incr(key);
    } catch (err) {
      console.warn(`Redis incr failed for key ${key}:`, err.message);
    }
  }
  return 0; // Stats key fallback
};

const getStats = () => {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    ratio: cacheHits + cacheMisses > 0 ? (cacheHits / (cacheHits + cacheMisses)).toFixed(4) : 0
  };
};

const del = async (key) => {
  if (!useLocalOnly && redisClient && redisClient.status === 'ready') {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn(`Redis del failed for key ${key}:`, err.message);
    }
  }
  localCache.del(key);
};

module.exports = {
  get,
  set,
  del,
  increment,
  getStats
};

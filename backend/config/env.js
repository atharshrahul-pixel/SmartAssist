require('dotenv').config();
const path = require('path');

const env = {
  aiProvider: process.env.AI_PROVIDER || '',
  aiMaxRetries: Number(process.env.AI_MAX_RETRIES || 2),
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 8000),
  dbProvider: process.env.DB_PROVIDER || 'firebase',
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'serviceAccountKey.json'),
  mongoDbUri: process.env.MONGODB_URI || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  nodeEnv: process.env.NODE_ENV || 'development',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || 'smartassist-secret-jwt-key',
};

module.exports = env;

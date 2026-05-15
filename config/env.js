require('dotenv').config();

const env = {
  aiProvider: process.env.AI_PROVIDER || '',
  aiMaxRetries: Number(process.env.AI_MAX_RETRIES || 2),
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 8000),
  dbProvider: process.env.DB_PROVIDER || 'firebase',
  mongoDbUri: process.env.MONGODB_URI || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  nodeEnv: process.env.NODE_ENV || 'development',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  port: Number(process.env.PORT || 5000),
};

module.exports = env;

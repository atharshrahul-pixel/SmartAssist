const env = require('../config/env');
const { generateRecommendationPrompt } = require('../prompts/promptGenerator');
const { normalizeSpecialistName } = require('../utils/responseValidator');

const TRANSIENT_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const buildGeminiGenerationConfig = () => {
  const config = {
    temperature: 0,
    maxOutputTokens: 32,
  };

  // SmartAssist only needs a tiny classification response, so avoid spending
  // Gemini 2.5 Flash tokens on hidden reasoning before the final label.
  if (env.geminiModel.includes('2.5-flash')) {
    config.thinkingConfig = {
      thinkingBudget: 0,
    };
  }

  return config;
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = env.aiTimeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

const fetchWithRetry = async (url, options = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= env.aiMaxRetries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, options);

      if (!TRANSIENT_STATUS_CODES.has(response.status) || attempt === env.aiMaxRetries) {
        return response;
      }

      lastError = new Error(`AI provider returned temporary status ${response.status}`);
    } catch (error) {
      lastError = error;

      if (attempt === env.aiMaxRetries) {
        throw lastError;
      }
    }

    await wait(500 * (attempt + 1));
  }

  throw lastError;
};

const askGemini = async (prompt) => {
  if (!env.geminiApiKey) {
    throw new Error('Gemini API key is missing');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: buildGeminiGenerationConfig(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const askOpenAi = async (prompt) => {
  if (!env.openAiApiKey) {
    throw new Error('OpenAI API key is missing');
  }

  const response = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.openAiModel,
      temperature: 0,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
};

const askGroq = async (prompt) => {
  if (!env.groqApiKey) {
    throw new Error('Groq API key is missing');
  }

  const response = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.groqModel,
      temperature: 0,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
};

const getAiRecommendation = async ({ problemDescription }) => {
  const provider = env.aiProvider.toLowerCase();

  if (!provider) {
    throw new Error('AI provider is not configured');
  }

  const prompt = generateRecommendationPrompt({ problemDescription });
  
  let rawResponse;
  if (provider === 'openai') {
    rawResponse = await askOpenAi(prompt);
  } else if (provider === 'groq') {
    rawResponse = await askGroq(prompt);
  } else {
    rawResponse = await askGemini(prompt);
  }

  const specialist = normalizeSpecialistName(rawResponse);

  if (!specialist) {
    throw new Error('AI returned an invalid specialist');
  }

  return specialist;
};

module.exports = {
  getAiRecommendation,
  fetchWithRetry,
  fetchWithTimeout,
};

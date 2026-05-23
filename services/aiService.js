const env = require('../config/env');
const { generateRecommendationPrompt } = require('../prompts/promptGenerator');
const { normalizeSpecialistName } = require('../utils/responseValidator');
const { execFile, spawn } = require('child_process');
const path = require('path');

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

let daemonProcess = null;
let daemonReady = false;
const queue = [];
let processing = false;

const startDaemon = () => {
  if (daemonProcess) return;

  const pythonPath = path.join(__dirname, '../venv/bin/python');
  const scriptPath = path.join(__dirname, '../transcribe_daemon.py');

  console.log('Starting Whisper daemon...');
  daemonProcess = spawn(pythonPath, [scriptPath]);

  let buffer = '';

  daemonProcess.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed === 'READY') {
        console.log('Whisper daemon is READY.');
        daemonReady = true;
        processQueue();
      } else if (trimmed.startsWith('INIT_ERROR:')) {
        console.error('Whisper daemon initialization error:', trimmed);
        cleanupDaemon();
      } else {
        if (queue.length > 0) {
          const { resolve, reject } = queue.shift();
          try {
            const result = JSON.parse(trimmed);
            if (result.success) {
              resolve(result.text);
            } else {
              reject(new Error(result.error));
            }
          } catch (err) {
            reject(new Error(`Failed to parse daemon response: ${trimmed}`));
          }
          processing = false;
          processQueue();
        }
      }
    }
  });

  daemonProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg.toLowerCase().includes('error')) {
      console.error(`Whisper daemon stderr: ${msg}`);
    }
  });

  daemonProcess.on('error', (err) => {
    console.error('Failed to start Whisper daemon:', err);
    cleanupDaemon();
  });

  daemonProcess.on('exit', (code) => {
    console.warn(`Whisper daemon exited with code ${code}`);
    cleanupDaemon();
    setTimeout(startDaemon, 5000);
  });
};

const cleanupDaemon = () => {
  daemonReady = false;
  daemonProcess = null;
  processing = false;
  while (queue.length > 0) {
    const { reject } = queue.shift();
    reject(new Error('Whisper daemon died unexpectedly'));
  }
};

const processQueue = () => {
  if (processing || !daemonReady || queue.length === 0) return;

  processing = true;
  const { filePath } = queue[0];
  daemonProcess.stdin.write(filePath + '\n');
};

startDaemon();

process.on('exit', () => {
  if (daemonProcess) daemonProcess.kill();
});
process.on('SIGINT', () => {
  if (daemonProcess) daemonProcess.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  if (daemonProcess) daemonProcess.kill();
  process.exit();
});

const transcribeAudioLocal = (filePath) => {
  return new Promise((resolve, reject) => {
    queue.push({ filePath, resolve, reject });
    processQueue();
  });
};

module.exports = {
  getAiRecommendation,
  fetchWithRetry,
  fetchWithTimeout,
  transcribeAudioLocal,
};

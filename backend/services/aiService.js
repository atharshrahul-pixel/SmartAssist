const env = require('../config/env');
const { generateRecommendationPrompt } = require('../prompts/promptGenerator');
const { normalizeSpecialistName } = require('../utils/responseValidator');
const { execFile, spawn } = require('child_process');
const path = require('path');

const TRANSIENT_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const buildGeminiGenerationConfig = (maxTokens) => {
  const config = {
    temperature: 0,
    maxOutputTokens: maxTokens || 32,
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

const askGemini = async (prompt, maxTokens) => {
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
      generationConfig: buildGeminiGenerationConfig(maxTokens),
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const askOpenAi = async (prompt, maxTokens = 10) => {
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
      max_tokens: maxTokens,
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

const askGroq = async (prompt, maxTokens = 10) => {
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
      max_tokens: maxTokens,
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

const callLLM = async (prompt, maxTokens) => {
  const provider = (env.aiProvider || '').toLowerCase();
  if (!provider) {
    throw new Error('AI provider is not configured');
  }
  if (provider === 'openai') {
    return await askOpenAi(prompt, maxTokens);
  } else if (provider === 'groq') {
    return await askGroq(prompt, maxTokens);
  }

  // Gemini is the primary provider. If it is unavailable or returns an
  // error, try Groq and then OpenAI before surfacing the failure to the caller.
  try {
    return await askGemini(prompt, maxTokens);
  } catch (geminiError) {
    console.warn(`Gemini request failed; trying Groq fallback: ${geminiError.message}`);
    try {
      return await askGroq(prompt, maxTokens);
    } catch (groqError) {
      console.warn(`Groq request failed; trying OpenAI fallback: ${groqError.message}`);
      return await askOpenAi(prompt, maxTokens);
    }
  }
};

const getAiRecommendation = async ({ problemDescription }) => {
  const provider = env.aiProvider.toLowerCase();

  if (!provider) {
    throw new Error('AI provider is not configured');
  }

  const prompt = generateRecommendationPrompt({ problemDescription });
  
  const rawResponse = await callLLM(prompt);

  const specialist = normalizeSpecialistName(rawResponse);

  if (!specialist) {
    throw new Error('AI returned an invalid specialist');
  }

  return specialist;
};

let daemonProcess = null;
let daemonReady = false;
let restartCount = 0;
const MAX_RESTARTS = 3;
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
        restartCount = 0;
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
    console.error(`Whisper daemon stderr: ${data.toString().trim()}`);
  });

  daemonProcess.on('error', (err) => {
    console.error('Failed to start Whisper daemon:', err);
    cleanupDaemon();
  });

  daemonProcess.on('exit', (code) => {
    console.warn(`Whisper daemon exited with code ${code}`);
    cleanupDaemon();
    
    restartCount += 1;
    if (restartCount <= MAX_RESTARTS) {
      console.log(`Re-starting Whisper daemon (attempt ${restartCount}/${MAX_RESTARTS})...`);
      setTimeout(startDaemon, 5000);
    } else {
      console.error('Whisper daemon crashed too many times. Disabling local transcription restarts. Will use external API fallback.');
    }
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

const transcribeAudioExternal = async (filePath) => {
  if (env.groqApiKey) {
    try {
      console.log('Attempting transcription via Groq Whisper API...');
      const formData = new FormData();
      const fs = require('fs');
      const blob = new Blob([fs.readFileSync(filePath)], { type: 'audio/wav' });
      formData.append('file', blob, 'audio.wav');
      formData.append('model', 'whisper-large-v3');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.groqApiKey}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          console.log('Groq Whisper transcription success.');
          return data.text.trim();
        }
      }
      console.warn('Groq Whisper API returned status:', response.status);
    } catch (err) {
      console.error('Groq Whisper API error:', err);
    }
  }

  if (env.openAiApiKey) {
    try {
      console.log('Attempting transcription via OpenAI Whisper API...');
      const formData = new FormData();
      const fs = require('fs');
      const blob = new Blob([fs.readFileSync(filePath)], { type: 'audio/wav' });
      formData.append('file', blob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.openAiApiKey}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          console.log('OpenAI Whisper transcription success.');
          return data.text.trim();
        }
      }
      console.warn('OpenAI Whisper API returned status:', response.status);
    } catch (err) {
      console.error('OpenAI Whisper API error:', err);
    }
  }

  throw new Error('External transcription API keys are missing or requests failed.');
};

const transcribeAudioResilient = async (filePath) => {
  if (!daemonReady) {
    try {
      return await transcribeAudioExternal(filePath);
    } catch (err) {
      console.warn('External fallback failed, trying local queue:', err.message);
    }
  }

  try {
    return await new Promise((resolve, reject) => {
      queue.push({ filePath, resolve, reject });
      processQueue();
    });
  } catch (localErr) {
    console.warn('Local transcription failed, trying external fallback:', localErr.message);
    try {
      return await transcribeAudioExternal(filePath);
    } catch (extErr) {
      throw new Error(`Transcription failed: Local (${localErr.message}), External (${extErr.message})`);
    }
  }
};

module.exports = {
  getAiRecommendation,
  fetchWithRetry,
  fetchWithTimeout,
  transcribeAudioLocal: transcribeAudioResilient,
  callLLM,
};

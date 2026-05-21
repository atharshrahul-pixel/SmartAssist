const { getRecommendation } = require('../services/recommendationService');
const { getTriageResponse } = require('../services/triageService');
const CustomError = require('../utils/customError');

const recommendSpecialist = async (req, res) => {
  const { name, problemDescription, problem } = req.body;
  const description = problemDescription || problem;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new CustomError('Name is required', 400);
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    throw new CustomError('Problem description is required', 400);
  }

  if (description.length > 500) {
    throw new CustomError('Problem description must be 500 characters or less', 400);
  }

  const recommendation = await getRecommendation({ problemDescription: description });

  res.status(200).json({
    success: true,
    recommendedSpecialist: recommendation.recommendedSpecialist,
    source: recommendation.source,
  });
};

const triageConversation = async (req, res) => {
  const { name, messages } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new CustomError('Name is required', 400);
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new CustomError('Messages history is required', 400);
  }

  const sanitizedMessages = messages.map(msg => {
    if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
      throw new CustomError('Invalid message role', 400);
    }
    if (typeof msg.content !== 'string') {
      throw new CustomError('Invalid message content', 400);
    }
    const sanitizedContent = msg.content.replace(/<[^>]*>/g, '').trim();
    return {
      role: msg.role,
      content: sanitizedContent
    };
  });

  const latestMessage = sanitizedMessages[sanitizedMessages.length - 1];
  if (latestMessage.role !== 'user') {
    throw new CustomError('Latest message must be from user', 400);
  }

  if (!latestMessage.content) {
    throw new CustomError('User message content cannot be empty', 400);
  }

  if (latestMessage.content.length > 500) {
    throw new CustomError('User message must be 500 characters or less', 400);
  }

  const forceFallback = req.query.simulateFallback === 'true' && process.env.NODE_ENV !== 'production';

  const triageResult = await getTriageResponse({
    name: name.trim(),
    messages: sanitizedMessages,
    forceFallback
  });

  res.status(200).json({
    success: true,
    ...triageResult
  });
};

module.exports = {
  recommendSpecialist,
  triageConversation,
};

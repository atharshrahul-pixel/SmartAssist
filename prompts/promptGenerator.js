const { SPECIALIST_CATEGORIES } = require('../constants/specialists');

const generateRecommendationPrompt = ({ problemDescription }) => {
  return [
    'You are the classification engine for SmartAssist, a specialist appointment booking app.',
    'Classify the user problem into exactly one specialist category.',
    'Understand English, Tamil, Hindi, Chinese, Telugu, Kannada, Tanglish, Hinglish, spelling mistakes, mixed language, and broken grammar.',
    `Allowed outputs only: ${SPECIALIST_CATEGORIES.join(', ')}.`,
    'Return only the specialist name. Do not include medical advice, explanation, punctuation, markdown, or extra text.',
    '',
    `User problem: ${problemDescription}`,
  ].join('\n');
};

module.exports = {
  generateRecommendationPrompt,
};

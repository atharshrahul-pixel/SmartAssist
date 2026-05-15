const { getAiRecommendation } = require('./aiService');
const { getKeywordRecommendation } = require('../utils/fallbackKeywordEngine');

const getRecommendation = async ({ problemDescription }) => {
  const keywordRecommendation = getKeywordRecommendation(problemDescription);

  try {
    const aiRecommendation = await getAiRecommendation({ problemDescription });
    return {
      recommendedSpecialist: aiRecommendation,
      source: 'AI',
    };
  } catch (error) {
    return {
      recommendedSpecialist: keywordRecommendation,
      source: 'Keyword',
    };
  }
};

module.exports = {
  getRecommendation,
};

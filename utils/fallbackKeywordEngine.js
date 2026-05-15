const { KEYWORD_MAPPINGS } = require('../constants/specialists');

const normalizeProblemText = (text = '') => text.toString().toLowerCase().trim();

const getKeywordRecommendation = (problemDescription) => {
  const normalizedText = normalizeProblemText(problemDescription);
  const scores = {};

  Object.entries(KEYWORD_MAPPINGS).forEach(([specialist, keywords]) => {
    scores[specialist] = keywords.reduce((score, keyword) => {
      return normalizedText.includes(keyword.toLowerCase()) ? score + 1 : score;
    }, 0);
  });

  const [bestSpecialist, bestScore] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  return bestScore > 0 ? bestSpecialist : 'Physiotherapist';
};

module.exports = {
  getKeywordRecommendation,
};

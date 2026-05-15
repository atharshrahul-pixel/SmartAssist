const { getRecommendation } = require('../services/recommendationService');
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

module.exports = {
  recommendSpecialist,
};

const { SPECIALIST_CATEGORIES } = require('../constants/specialists');

const normalizeSpecialistName = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const cleaned = value.trim().replace(/^["']|["']$/g, '');
  return SPECIALIST_CATEGORIES.find(
    (specialist) => specialist.toLowerCase() === cleaned.toLowerCase()
  ) || null;
};

const isAllowedSpecialist = (value) => Boolean(normalizeSpecialistName(value));

module.exports = {
  isAllowedSpecialist,
  normalizeSpecialistName,
};

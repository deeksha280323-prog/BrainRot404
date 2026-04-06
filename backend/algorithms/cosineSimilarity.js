/**
 * Converts a skill level string to a numerical weight.
 */
const getSkillWeight = (level) => {
  const weights = {
    'Beginner': 0.25,
    'Intermediate': 0.5,
    'Advanced': 0.75,
    'Expert': 1.0
  };
  return weights[level] || 0;
};

/**
 * Creates a weighted skill dictionary for a user.
 * { "react": 0.75, "node.js": 0.5, ... }
 */
const createUserVector = (skills) => {
  const vector = {};
  if (!skills) return vector;
  
  skills.forEach(skill => {
    // Normalize skill name to lowercase for consistent matching
    const skillName = skill.name.toLowerCase().trim();
    vector[skillName] = getSkillWeight(skill.level);
  });
  return vector;
};

/**
 * Calculates the cosine similarity between two skill vectors.
 * Returns a percentage 0-100.
 */
const calculateCosineSimilarity = (vectorA, vectorB) => {
  // Get all unique skill names from both vectors
  const allSkills = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);
  
  if (allSkills.size === 0) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  allSkills.forEach(skill => {
    const valA = vectorA[skill] || 0;
    const valB = vectorB[skill] || 0;

    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  });

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  const similarity = dotProduct / (magnitudeA * magnitudeB);
  
  // Convert to percentage and round to nearest integer
  return Math.round(similarity * 100);
};

module.exports = {
  createUserVector,
  calculateCosineSimilarity,
  getSkillWeight
};

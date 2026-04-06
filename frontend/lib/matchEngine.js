export const getSkillWeight = (level) => {
  const weights = {
    'Beginner': 0.25,
    'Intermediate': 0.5,
    'Advanced': 0.75,
    'Expert': 1.0
  };
  return weights[level] || 0;
};

export const createUserVector = (skills) => {
  const vector = {};
  if (!skills) return vector;
  
  skills.forEach(skill => {
    const skillName = skill.name.toLowerCase().trim();
    vector[skillName] = getSkillWeight(skill.level);
  });
  return vector;
};

export const calculateCosineSimilarity = (vectorA, vectorB) => {
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
  return Math.round(similarity * 100);
};

export const getSim = (user1, user2) => {
  return calculateCosineSimilarity(
    createUserVector(user1.skills), 
    createUserVector(user2.skills)
  );
};

const User = require('../models/User');
const { createUserVector, calculateCosineSimilarity } = require('./cosineSimilarity');

/**
 * Finds and ranks potential matches for a given user.
 * @param {String} userId - The ID of the user looking for matches
 * @param {Object} filters - Optional filters (e.g., { campus: 'MIT' })
 * @returns {Array} List of matches with scores, sorted by score descending
 */
const findMatches = async (userId, filters = {}) => {
  try {
    // 1. Fetch the source user
    const sourceUser = await User.findById(userId);
    if (!sourceUser) throw new Error('User not found');

    // Users already interacted with (swiped right or left)
    const swipedUserIds = [
      ...(sourceUser.swipedRight || []),
      ...(sourceUser.swipedLeft || []),
      sourceUser._id
    ];

    // 2. Fetch potential matches (exclude self, already swiped, not onboarded)
    const query = {
      _id: { $nin: swipedUserIds },
      onboardingCompleted: true,
      ...filters
    };
    const potentialMatches = await User.find(query).select('-passwordHash -swipedRight -swipedLeft -matches');

    // 3. Create vector for source user
    const sourceVector = createUserVector(sourceUser.skills);

    // 4. Calculate scores for all potential matches
    const scoredMatches = potentialMatches.map(targetUser => {
      const targetVector = createUserVector(targetUser.skills);
      let score = calculateCosineSimilarity(sourceVector, targetVector);

      // --- Additional weighting logic (as per readme) ---
      
      // Bonus for same college
      if (sourceUser.campus?.college && targetUser.campus?.college) {
        if (sourceUser.campus.college.toLowerCase() === targetUser.campus.college.toLowerCase()) {
           score = Math.min(100, score + 5); // +5% boost for same college
        }
      }

      // Bonus for similar overall experience level
      if (sourceUser.experienceLevel?.overall === targetUser.experienceLevel?.overall) {
          score = Math.min(100, score + 2); // +2% boost for same overall experience
      }

      // Location Bonus Factor (+10 state, +5 country)
      if (sourceUser.state && targetUser.state && sourceUser.state.toLowerCase() === targetUser.state.toLowerCase()) {
        score = Math.min(100, score + 10);
      } else if (sourceUser.country && targetUser.country && sourceUser.country.toLowerCase() === targetUser.country.toLowerCase()) {
        score = Math.min(100, score + 5);
      }

      return {
        user: targetUser,
        matchScore: score
      };
    });

    // 5. Sort matches descending by score
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    return scoredMatches;

  } catch (error) {
    console.error('Error in match engine:', error);
    throw error;
  }
};

module.exports = {
  findMatches
};

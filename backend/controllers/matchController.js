const { findMatches } = require('../algorithms/matchEngine');
const { createUserVector, calculateCosineSimilarity } = require('../algorithms/cosineSimilarity');
const User = require('../models/User');

/**
 * @desc    Get prioritized list of matches for logged in user
 * @route   GET /api/matches
 * @access  Private
 */
const getMatches = async (req, res) => {
  try {
    const filters = {};
    if (req.query.state) filters.state = req.query.state;
    if (req.query.country) filters.country = req.query.country;

    const matches = await findMatches(req.user.id, filters);
    res.json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error finding matches' });
  }
};

/**
 * @desc    Record a swipe action (like/pass)
 * @route   POST /api/matches/swipe
 * @access  Private
 */
const recordSwipe = async (req, res) => {
  try {
    const { targetUserId, action } = req.body; // action: 'right' or 'left'

    if (!targetUserId || !action) {
       return res.status(400).json({ message: 'Target user ID and action are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check if already swiped to avoid duplicates
    const alreadySwipedRight = user.swipedRight.some(id => id.toString() === targetUserId);
    const alreadySwipedLeft = user.swipedLeft.some(id => id.toString() === targetUserId);

    if (action === 'right' || action === 'super') {
       if (!alreadySwipedRight) {
           user.swipedRight.push(targetUserId);
           // Remove from left if it was there (merging features)
           user.swipedLeft = user.swipedLeft.filter(id => id.toString() !== targetUserId);
       }
    } else if (action === 'left') {
        if (!alreadySwipedLeft) {
           user.swipedLeft.push(targetUserId);
           // Remove from right if it was there
           user.swipedRight = user.swipedRight.filter(id => id.toString() !== targetUserId);
        }
    }

    await user.save();
    res.json({ message: 'Swipe recorded successfully', action });

  } catch (error) {
    console.error('Error recording swipe:', error);
    res.status(500).json({ message: 'Error recording swipe' });
  }
};

/**
 * @desc    Compare two temporary users manually for live demo
 * @route   POST /api/matches/demo-compare
 * @access  Public
 */
const demoCompare = async (req, res) => {
  try {
    const { user1Skills, user2Skills } = req.body;

    const vector1 = createUserVector(user1Skills);
    const vector2 = createUserVector(user2Skills);

    const matchScore = calculateCosineSimilarity(vector1, vector2);

    res.json({ matchScore, vector1, vector2 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error comparing demo users' });
  }
};

/**
 * @desc    Get detailed lists of swiped profiles (accepted and rejected)
 * @route   GET /api/matches/swiped
 * @access  Private
 */
const getSwipedProfiles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const acceptedUsers = await User.find({ _id: { $in: user.swipedRight } }).select('-passwordHash');
    const rejectedUsers = await User.find({ _id: { $in: user.swipedLeft } }).select('-passwordHash');

    // Calculate scores again for consistency in grid visualization
    const v1 = createUserVector(user.skills);
    
    const formatUser = (u) => {
      const v2 = createUserVector(u.skills);
      const score = calculateCosineSimilarity(v1, v2);
      return { user: u, matchScore: score };
    };

    res.json({
      accepted: acceptedUsers.map(formatUser),
      rejected: rejectedUsers.map(formatUser)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching swiped profiles' });
  }
};

module.exports = {
  getMatches,
  recordSwipe,
  demoCompare,
  getSwipedProfiles
};

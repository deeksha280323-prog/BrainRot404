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
    
    if (action === 'right') {
       if (!user.swipedRight.includes(targetUserId)) {
           user.swipedRight.push(targetUserId);
           // In a full system, you would check if the target swiped right too
           // and if so, create a 'Match' record/notification.
       }
    } else if (action === 'left') {
        if (!user.swipedLeft.includes(targetUserId)) {
           user.swipedLeft.push(targetUserId);
        }
    }

    await user.save();
    res.json({ message: 'Swipe recorded successfully' });

  } catch (error) {
    console.error(error);
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

module.exports = {
  getMatches,
  recordSwipe,
  demoCompare
};

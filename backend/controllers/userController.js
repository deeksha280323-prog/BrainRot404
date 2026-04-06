const User = require('../models/User');

/**
 * @desc    Update user profile (used for onboarding wizard)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.campus = req.body.campus || user.campus;
    user.experienceLevel = req.body.experienceLevel || user.experienceLevel;
    user.skills = req.body.skills || user.skills;
    user.onboardingCompleted = req.body.onboardingCompleted !== undefined ? req.body.onboardingCompleted : user.onboardingCompleted;

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

/**
 * @desc    Get all users (basic list)
 * @route   GET /api/users
 * @access  Private
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ onboardingCompleted: true })
      .select('-passwordHash -swipedRight -swipedLeft');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
       .select('-passwordHash -swipedRight -swipedLeft');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

module.exports = {
  updateUserProfile,
  getUsers,
  getUserById,
};

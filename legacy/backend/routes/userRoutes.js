const express = require('express');
const router = express.Router();
const { updateUserProfile, getUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/').get(protect, getUsers);
router.route('/profile').put(protect, updateUserProfile);
router.route('/profile/picture').put(protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});
router.route('/:id').get(protect, getUserById);

module.exports = router;

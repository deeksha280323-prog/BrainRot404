const express = require('express');
const router = express.Router();
const { getMatches, recordSwipe, demoCompare } = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getMatches);
router.route('/swipe').post(protect, recordSwipe);
router.route('/demo-compare').post(demoCompare);

module.exports = router;

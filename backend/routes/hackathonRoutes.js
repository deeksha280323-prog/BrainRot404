const express = require('express');
const router = express.Router();
const { joinHackathon, getHackathonMatches, generateSuggestedTeams } = require('../controllers/hackathonController');

router.route('/join').post(joinHackathon);
router.route('/:id/matches').get(getHackathonMatches);
router.route('/:id/teams').get(generateSuggestedTeams);

module.exports = router;

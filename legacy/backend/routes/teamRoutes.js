const express = require('express');
const router = express.Router();
const { 
  createTeam, 
  getTeams, 
  getTeamById, 
  sendJoinRequest, 
  getTeamRequests, 
  respondJoinRequest 
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createTeam)
  .get(protect, getTeams);

router.post('/request', protect, sendJoinRequest);
router.put('/request/:requestId', protect, respondJoinRequest);

router.route('/:id')
  .get(protect, getTeamById);

router.get('/:id/requests', protect, getTeamRequests);

module.exports = router;

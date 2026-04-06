const Team = require('../models/Team');
const JoinRequest = require('../models/JoinRequest');
const User = require('../models/User');

/**
 * @desc    Create a new team
 * @route   POST /api/teams
 * @access  Private
 */
const createTeam = async (req, res) => {
  try {
    const { name, hackathonTrack, maxSize, requiredSkills, minExperienceLevel, description } = req.body;

    const team = await Team.create({
      name,
      hackathonTrack,
      maxSize,
      requiredSkills,
      minExperienceLevel,
      description,
      leader: req.user.id,
      members: [req.user.id] // Leader is automatically a member
    });

    // Update user's teamId
    await User.findByIdAndUpdate(req.user.id, { teamId: team._id });

    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating team' });
  }
};

/**
 * @desc    Get all teams
 * @route   GET /api/teams
 * @access  Private
 */
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('leader', 'name profilePicture');
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

/**
 * @desc    Get team by ID
 * @route   GET /api/teams/:id
 * @access  Private
 */
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name profilePicture skills experienceLevel')
      .populate('members', 'name profilePicture skills experienceLevel');
      
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching team' });
  }
};

/**
 * @desc    Send a join request to a team
 * @route   POST /api/teams/request
 * @access  Private
 */
const sendJoinRequest = async (req, res) => {
  try {
    const { teamId, message } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.members.length >= team.maxSize) {
       return res.status(400).json({ message: 'Team is already full' });
    }

    const existingRequest = await JoinRequest.findOne({ team: teamId, user: req.user.id });
    if (existingRequest) {
      return res.status(400).json({ message: 'Join request already sent' });
    }

    const request = await JoinRequest.create({
      team: teamId,
      user: req.user.id,
      message
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending join request' });
  }
};

/**
 * @desc    Get all join requests for a team (leader only)
 * @route   GET /api/teams/:id/requests
 * @access  Private
 */
const getTeamRequests = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    // Ensure only leader can see requests
    if (team.leader.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to view these requests' });
    }

    const requests = await JoinRequest.find({ team: req.params.id, status: 'pending' })
       .populate('user', 'name profilePicture skills experienceLevel campus');
       
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

/**
 * @desc    Respond to join request (Accept or Reject)
 * @route   PUT /api/teams/request/:requestId
 * @access  Private
 */
const respondJoinRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const request = await JoinRequest.findById(req.params.requestId).populate('team');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    const team = request.team;

    if (team.leader.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to respond' });
    }

    if (status === 'accepted') {
       if (team.members.length >= team.maxSize) {
           return res.status(400).json({ message: 'Team is already full' });
       }
       
       team.members.push(request.user);
       await team.save();

       // Update user's teamId
       await User.findByIdAndUpdate(request.user, { teamId: team._id });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error responding to request' });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  sendJoinRequest,
  getTeamRequests,
  respondJoinRequest
};

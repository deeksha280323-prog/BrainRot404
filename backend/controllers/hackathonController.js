const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createUserVector, calculateCosineSimilarity } = require('../algorithms/cosineSimilarity');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Fast-join a local hackathon
// @route   POST /api/hackathon/join
// @access  Public
const joinHackathon = async (req, res) => {
  try {
    const { name, email, skills, experienceLevel, campus, state, hackathonId } = req.body;
    
    // Parse skills if string
    let parsedSkills = [];
    if (typeof skills === 'string') {
        parsedSkills = skills.split(',').map(s => ({ 
            name: s.trim(), 
            level: experienceLevel || 'Beginner' 
        }));
    } else {
        parsedSkills = skills || [];
    }

    // Auto-generate required fields for physical attendees
    const targetEmail = email || `local_hacker_${Date.now()}_${Math.floor(Math.random()*1000)}@hackathon.dev`;
    
    // Check if user exists, otherwise create dummy password
    let user = await User.findOne({ email: targetEmail });
    const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
    
    if (user) {
      user.hackathonId = hackathonId;
      user.isLocalParticipant = true;
      user.skills = parsedSkills; // overwrite for demo
      await user.save();
    } else {
      user = await User.create({
        name,
        email: targetEmail,
        passwordHash,
        campus: { college: campus },
        state,
        skills: parsedSkills,
        experienceLevel: { overall: experienceLevel, yearsOfCoding: 1 },
        hackathonId,
        isLocalParticipant: true,
        onboardingCompleted: true
      });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error joining hackathon' });
  }
};

// @desc    Get sorted matrix of participants
// @route   GET /api/hackathon/:id/matches
// @access  Public
const getHackathonMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await User.find({ hackathonId: id, isLocalParticipant: true });

    if (users.length < 2) {
      return res.json({ totalParticipants: users.length, topPairs: [] });
    }

    // Build exhaustive pairs
    const pairs = [];
    for (let i = 0; i < users.length; i++) {
      const v1 = createUserVector(users[i].skills);
      for (let j = i + 1; j < users.length; j++) {
        const v2 = createUserVector(users[j].skills);
        const score = calculateCosineSimilarity(v1, v2);
        pairs.push({
          user1: users[i],
          user2: users[j],
          score
        });
      }
    }

    // Sort descending
    pairs.sort((a, b) => b.score - a.score);

    res.json({
      totalParticipants: users.length,
      topPairs: pairs.slice(0, 50) // Return top matches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching hackathon matches' });
  }
};

// @desc    Greedy algorithm for auto-teams
// @route   GET /api/hackathon/:id/teams
// @access  Public
const generateSuggestedTeams = async (req, res) => {
  try {
    const { id } = req.params;
    let users = await User.find({ hackathonId: id, isLocalParticipant: true });
    
    if (users.length < 3) return res.json({ teams: [] });

    // Precompute vectors
    const userVectors = users.map(u => ({ user: u, vector: createUserVector(u.skills) }));
    
    // Similarity dictionary
    const getSim = (u1, u2) => calculateCosineSimilarity(
      userVectors.find(uv => uv.user._id.toString() === u1._id.toString()).vector,
      userVectors.find(uv => uv.user._id.toString() === u2._id.toString()).vector
    );

    const teams = [];
    const minTeamSize = 3;
    const maxTeamSize = 4;
    
    // Unassigned pool
    let pool = [...users];

    while (pool.length >= minTeamSize) {
      // Find absolute highest pair in pool
      let bestPair = [pool[0], pool[1]];
      let bestScore = -1;
      
      for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
          const score = getSim(pool[i], pool[j]);
          if (score > bestScore) {
            bestScore = score;
            bestPair = [pool[i], pool[j]];
          }
        }
      }

      const currentTeam = [...bestPair];
      // Remove them from pool
      pool = pool.filter(u => u._id !== bestPair[0]._id && u._id !== bestPair[1]._id);

      // Iteratively expand up to maxTeamSize
      while (currentTeam.length < maxTeamSize && pool.length > 0) {
        // Find pool member with highest AVERAGE similarity to current team
        let bestCandidate = null;
        let bestCandidateScore = -1;

        for (const candidate of pool) {
          let sum = 0;
          for (const member of currentTeam) {
            sum += getSim(candidate, member);
          }
          const avg = sum / currentTeam.length;
          
          if (avg > bestCandidateScore) {
            bestCandidateScore = avg;
            bestCandidate = candidate;
          }
        }

        // Add to team
        currentTeam.push(bestCandidate);
        pool = pool.filter(u => u._id !== bestCandidate._id);
      }

      // Calculate final team average alignment
      let totalAssessedPairs = 0;
      let sumAlignment = 0;
      for (let i=0; i<currentTeam.length; i++) {
         for (let j=i+1; j<currentTeam.length; j++) {
            sumAlignment += getSim(currentTeam[i], currentTeam[j]);
            totalAssessedPairs++;
         }
      }
      const teamCompatibility = Math.round(sumAlignment / totalAssessedPairs);

      teams.push({
        members: currentTeam,
        compatibilityScore: teamCompatibility
      });
    }

    res.json({
      teams,
      leftovers: pool // Those who didn't fit cleanly
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating teams' });
  }
};

module.exports = {
  joinHackathon,
  getHackathonMatches,
  generateSuggestedTeams
};

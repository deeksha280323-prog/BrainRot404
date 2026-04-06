const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  hackathonTrack: {
    type: String,
    default: ''
  },
  maxSize: {
    type: Number,
    default: 4,
    min: 2,
    max: 10
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  minExperienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);

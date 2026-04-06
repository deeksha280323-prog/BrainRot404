const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  campus: {
    college: { type: String, default: '' },
    region: { type: String, default: '' },
    city: { type: String, default: '' },
    department: { type: String, default: '' },
    graduationYear: { type: Number, default: null }
  },
  state: { type: String, default: '' },
  country: { type: String, default: '' },
  timezone: { type: String, default: '' },
  experienceLevel: {
    overall: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    yearsOfCoding: { type: Number, default: 0 }
  },
  skills: [{
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    verified: { type: Boolean, default: false }
  }],
  certifications: [{
    skill: { type: String },
    proofUrl: { type: String },
    verified: { type: Boolean, default: false }
  }],
  interests: [{
    type: String,
    trim: true
  }],
  availabilityHours: {
    type: Number,
    default: 0,
    min: 0,
    max: 168
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  hackathonId: {
    type: String,
    default: null
  },
  isLocalParticipant: {
    type: Boolean,
    default: false
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  swipedRight: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  swipedLeft: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ 'campus.college': 1 });
userSchema.index({ 'campus.city': 1 });
userSchema.index({ 'experienceLevel.overall': 1 });

module.exports = mongoose.model('User', userSchema);

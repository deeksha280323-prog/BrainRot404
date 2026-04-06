const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 300,
    default: ''
  }
}, {
  timestamps: true
});

// Prevent duplicate requests
joinRequestSchema.index({ team: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);

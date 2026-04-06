const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for fast retrieval of team messages
messageSchema.index({ team: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

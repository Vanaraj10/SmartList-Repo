const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  shareableId: {
    type: String,
    unique: true,
    default: () => uuidv4().replace(/-/g, '').substring(0, 8) // Short 8-char ID
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('List', listSchema);

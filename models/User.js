// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
  },
  email: { 
    type: String, 
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['GUEST', 'VIEWER', 'OPERATOR', 'ADMIN'],
    default: 'GUEST',
    required: true
  },
  otp: {
    code: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
    lastGeneratedAt: {
      type: Date,
      default: null
    }
  }
}, { collection: 'authorized-users' });

module.exports = mongoose.model('User', userSchema);

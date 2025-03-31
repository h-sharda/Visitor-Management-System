const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastGeneratedAt: {
    type: Date,
    required: true
  },
}, { collection: 'user-otps' });

module.exports = mongoose.model('OTP', otpSchema);

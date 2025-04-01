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

otpSchema.pre("save", function (next) {
  this.email = this.email.toLowerCase().trim();
  next();
});

module.exports = mongoose.model('OTP', otpSchema);

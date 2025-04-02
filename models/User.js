import mongoose from 'mongoose';

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

userSchema.pre("save", function (next) {
  this.email = this.email.toLowerCase().trim();
  if (!this.fullName) {
    this.fullName = this.email.split('@')[0];
  }
  this.fullName = this.fullName.trim();
  next();
});

export default mongoose.model('User', userSchema);

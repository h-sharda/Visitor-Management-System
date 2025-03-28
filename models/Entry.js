const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  timestamp: { 
    type: Date, 
    default: Date.now
  },
  imageKey: { 
    type: String, 
    required: true 
  },
  number: { 
    type: String, 
    default: "ABC123"
  }
});

module.exports = mongoose.model('Entry', entrySchema);

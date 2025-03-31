// models/Entry.js

const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  timestamp: { 
    type: Date,
    required: true
  },
  imageKey: { 
    type: String, 
    required: true 
  },
  number: { 
    type: String, 
    default: "ABC123"
  }
}, { collection: 'vehicle-entries' });

module.exports = mongoose.model('Entry', entrySchema);

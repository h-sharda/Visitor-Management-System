import mongoose from 'mongoose';

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

export default mongoose.model('Entry', entrySchema);

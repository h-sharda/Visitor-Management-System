import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Use a global variable to store the connection across function calls
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn; // Return existing connection
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Reduce timeout to fail fast
      socketTimeoutMS: 45000, // Prevent disconnections
      maxPoolSize: 10, // Allow connection reuse
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Immediately establish a connection when the module is imported
connectToDatabase()
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

export { connectToDatabase };

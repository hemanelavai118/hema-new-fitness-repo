const mongoose = require('mongoose');

let isConnected;

const connectDB = async () => {
  // If already connected, return existing connection (important for serverless)
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pooling for serverless
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeout settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit in serverless - log and continue
    isConnected = false;
    throw error;
  }
};

module.exports = connectDB;

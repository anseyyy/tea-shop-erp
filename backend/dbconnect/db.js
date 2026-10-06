const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const mongoUri = process.env.MongoURL || process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MongoDB Connection Error: MongoURL / MONGODB_URI is not defined in environment variables.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;


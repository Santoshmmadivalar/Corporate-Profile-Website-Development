import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/outpro';
    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected.');
    });

    // Disable buffering so queries fail-fast if database is disconnected
    mongoose.set('bufferCommands', false);

    // Shorten initial connection timeout so it boots fast even if offline
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
  } catch (error: any) {
    console.error('Database connection failed. Proceeding in offline mode:', error.message);
  }
};

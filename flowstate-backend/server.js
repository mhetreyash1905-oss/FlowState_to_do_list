import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error('MongoDB connection string is missing. Set MONGO_URI in .env.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);

  app.listen(PORT, () => {
    console.log('Server running on port', PORT);
  });
}

startServer();
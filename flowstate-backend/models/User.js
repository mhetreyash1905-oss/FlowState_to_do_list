import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  passwordHash: String,
  occupation: String,
  timezone: String,
  bio: String,
  goals: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
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
  coins: { type: Number, default: 0 },
  totalCoinsEarned: { type: Number, default: 0 },
  totalCoinsPenalized: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
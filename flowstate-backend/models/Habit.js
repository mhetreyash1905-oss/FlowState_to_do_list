import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  score: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  category: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Habit', habitSchema);
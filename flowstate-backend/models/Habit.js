import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  score: { type: Number, default: 0 },
  category: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'extreme'], default: 'medium' },
  priority: { type: Number, min: 1, max: 5, default: 3 },
  coinReward: { type: Number, default: 25 }, // Can be customized per habit
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  dayOfWeek: [Number], // 0-6 for weekly habits (0=Sunday, 6=Saturday)
  recurringDays: [Number], // 1-31 for monthly habits
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: Date,
  completionHistory: [
    {
      date: Date,
      completed: Boolean,
      duration: Number, // in minutes, optional
      notes: String, // optional notes on completion
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Habit', habitSchema);
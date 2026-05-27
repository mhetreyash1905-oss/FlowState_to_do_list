import mongoose from 'mongoose';

const habitCompletionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  completedDate: { type: Date, default: Date.now },
  duration: Number, // in minutes, optional
  notes: String,
  coinsEarned: { type: Number, default: 0 },
  streakBonus: { type: Number, default: 0 },
  priorityBonus: { type: Number, default: 0 },
  totalCoinsAwarded: { type: Number, default: 0 }, // coinsEarned + streakBonus + priorityBonus
  createdAt: { type: Date, default: Date.now },
});

// Index for fast queries
habitCompletionSchema.index({ userId: 1, habitId: 1, completedDate: -1 });
habitCompletionSchema.index({ userId: 1, completedDate: -1 });

export default mongoose.model('HabitCompletion', habitCompletionSchema);

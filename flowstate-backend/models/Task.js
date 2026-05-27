import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, // 'daily', 'weekly', 'monthly', 'todo'
  title: String,
  completed: { type: Boolean, default: false },
  completedAt: Date, // When the task was completed
  dueDate: Date,
  category: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'extreme'], default: 'medium' },
  coinReward: { type: Number, default: 15 }, // Can be customized per task
  priority: { type: Number, min: 1, max: 5, default: 3 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Task', taskSchema);
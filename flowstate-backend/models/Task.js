import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, // 'daily', 'weekly', 'monthly', 'todo'
  title: String,
  completed: { type: Boolean, default: false },
  dueDate: Date,
  category: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Task', taskSchema);
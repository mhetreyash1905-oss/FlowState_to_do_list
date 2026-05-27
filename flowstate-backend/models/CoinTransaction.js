import mongoose from 'mongoose';

const coinTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionType: {
    type: String,
    enum: ['completion', 'penalty', 'bonus', 'refund', 'manual'],
    required: true,
  },
  amount: { type: Number, required: true }, // positive or negative
  sourceId: mongoose.Schema.Types.ObjectId, // habitId or taskId
  sourceType: { type: String, enum: ['habit', 'task'], default: 'habit' },
  sourceName: String, // habit or task title for easy reference
  description: String, // human-readable description
  balanceBefore: Number, // user's coin balance before transaction
  balanceAfter: Number, // user's coin balance after transaction
  transactionDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Index for fast queries
coinTransactionSchema.index({ userId: 1, transactionDate: -1 });
coinTransactionSchema.index({ userId: 1, sourceId: 1 });
coinTransactionSchema.index({ userId: 1, transactionType: 1 });

export default mongoose.model('CoinTransaction', coinTransactionSchema);

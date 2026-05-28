import User from './models/User.js';
import CoinTransaction from './models/CoinTransaction.js';

const COIN_REWARDS = {
  easy: { habit: 10, task: 5 },
  medium: { habit: 25, task: 15 },
  hard: { habit: 50, task: 30 },
  extreme: { habit: 100, task: 75 },
};

const COIN_PENALTIES = {
  easy: -5,
  medium: -12,
  hard: -25,
  extreme: -50,
};

/**
 * Calculate base coin reward based on difficulty and type
 */
export const getBaseReward = (difficulty, type = 'habit') => {
  return COIN_REWARDS[difficulty]?.[type] || COIN_REWARDS.medium[type];
};

/**
 * Calculate streak bonus (1 coin per consecutive day, max 10)
 */
export const getStreakBonus = (streak) => {
  return Math.min(streak || 0, 10);
};

/**
 * Calculate priority bonus (priority × 0.5, max 2.5)
 */
export const getPriorityBonus = (priority) => {
  const bonus = (priority || 3) * 0.5;
  return Math.min(bonus, 2.5);
};

/**
 * Calculate total coins to award
 */
export const calculateTotalReward = (difficulty, streak = 0, priority = 3, type = 'habit') => {
  const base = getBaseReward(difficulty, type);
  const streakBonus = getStreakBonus(streak);
  const priorityBonus = getPriorityBonus(priority);
  return Math.floor(base + streakBonus + priorityBonus);
};

/**
 * Calculate penalty for missed task/habit
 */
export const calculatePenalty = (difficulty) => {
  return COIN_PENALTIES[difficulty] || COIN_PENALTIES.medium;
};

/**
 * Award coins to user and create transaction record
 */
export const awardCoins = async (userId, amount, transactionType, sourceId, sourceType, sourceName, description) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const balanceBefore = user.coins;
    const newBalance = Math.max(0, balanceBefore + amount); // Can't go below 0
    user.coins = newBalance;

    if (amount > 0) {
      user.totalCoinsEarned += amount;
    } else {
      user.totalCoinsPenalized += Math.abs(amount);
    }

    await user.save();

    // Create transaction record
    const transaction = new CoinTransaction({
      userId,
      transactionType,
      amount,
      sourceId,
      sourceType,
      sourceName,
      description,
      balanceBefore,
      balanceAfter: newBalance,
    });

    await transaction.save();

    return {
      success: true,
      newBalance,
      coinsAwarded: amount,
      transaction,
    };
  } catch (err) {
    console.error('Error awarding coins:', err);
    throw err;
  }
};

/**
 * Get user coin balance
 */
export const getUserBalance = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    return {
      coins: user.coins,
      totalEarned: user.totalCoinsEarned,
      totalPenalized: user.totalCoinsPenalized,
      netBalance: user.totalCoinsEarned - user.totalCoinsPenalized,
    };
  } catch (err) {
    console.error('Error getting coin balance:', err);
    throw err;
  }
};

/**
 * Get coin transaction history with pagination
 */
export const getCoinHistory = async (userId, limit = 50, skip = 0) => {
  try {
    const transactions = await CoinTransaction.find({ userId })
      .sort({ transactionDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await CoinTransaction.countDocuments({ userId });

    return {
      transactions,
      total,
      limit,
      skip,
      pages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error('Error getting coin history:', err);
    throw err;
  }
};

/**
 * Get coin statistics
 */
export const getCoinStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const transactions = await CoinTransaction.find({ userId });

    const stats = {
      currentCoins: user.coins,
      totalEarned: user.totalCoinsEarned,
      totalPenalized: user.totalCoinsPenalized,
      netBalance: user.totalCoinsEarned - user.totalCoinsPenalized,
      transactionCount: transactions.length,
      completionCount: transactions.filter((t) => t.transactionType === 'completion').length,
      penaltyCount: transactions.filter((t) => t.transactionType === 'penalty').length,
      bonusCount: transactions.filter((t) => t.transactionType === 'bonus').length,
      averageCoinsPerTransaction: transactions.length > 0
        ? Math.round((user.totalCoinsEarned - user.totalCoinsPenalized) / transactions.length)
        : 0,
    };

    return stats;
  } catch (err) {
    console.error('Error getting coin stats:', err);
    throw err;
  }
};

export default {
  getBaseReward,
  getStreakBonus,
  getPriorityBonus,
  calculateTotalReward,
  calculatePenalty,
  awardCoins,
  getUserBalance,
  getCoinHistory,
  getCoinStats,
};

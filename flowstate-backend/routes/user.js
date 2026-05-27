import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import CoinService from '../CoinService.js';
import HabitAnalyticsService from '../HabitAnalytics.js';
import PredictionService from '../PredictionService.js';

const router = express.Router();

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.passwordHash; // Prevent password update here
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============== TASK ENDPOINTS ===============

// Get tasks
router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add task
router.post('/tasks', auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, userId: req.userId });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete task and award coins
router.post('/tasks/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.completed = true;
    task.completedAt = new Date();
    await task.save();

    // Award coins
    const coinsAwarded = task.coinReward || CoinService.getBaseReward(task.difficulty, 'task');
    const result = await CoinService.awardCoins(
      req.userId,
      coinsAwarded,
      'completion',
      task._id,
      'task',
      task.title,
      `Completed task: ${task.title}`
    );

    res.json({
      task,
      coinsAwarded: result.coinsAwarded,
      newBalance: result.newBalance,
      message: 'Task completed! Coins awarded.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark task as incomplete/missed and apply penalty
router.post('/tasks/:id/incomplete-missed', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.completed = false;
    task.completedAt = null;
    await task.save();

    // Apply penalty
    const penalty = CoinService.calculatePenalty(task.difficulty);
    const result = await CoinService.awardCoins(
      req.userId,
      penalty,
      'penalty',
      task._id,
      'task',
      task.title,
      `Missed task: ${task.title}`
    );

    res.json({
      task,
      penaltyApplied: Math.abs(penalty),
      newBalance: result.newBalance,
      message: 'Task marked as missed. Penalty applied.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============== HABIT ENDPOINTS ===============

// Get habits
router.get('/habits', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add habit
router.post('/habits', auth, async (req, res) => {
  try {
    const habit = new Habit({ ...req.body, userId: req.userId });
    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update habit
router.put('/habits/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete habit
router.delete('/habits/:id', auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete habit and award coins
router.post('/habits/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    // Check if already completed today
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habit.completionHistory?.some((c) => c.date.toISOString().split('T')[0] === today);

    if (completedToday) {
      return res.status(400).json({ error: 'Habit already completed today' });
    }

    // Update streak
    const lastCompletion = habit.lastCompletedDate;
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = habit.currentStreak || 0;
    if (!lastCompletion || new Date(lastCompletion).toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
      newStreak += 1;
    } else if (new Date(lastCompletion).toISOString().split('T')[0] !== today) {
      newStreak = 1; // Reset streak if not completed yesterday or today
    }

    habit.currentStreak = newStreak;
    habit.longestStreak = Math.max(habit.longestStreak || 0, newStreak);
    habit.lastCompletedDate = now;
    habit.completionHistory.push({
      date: now,
      completed: true,
    });
    await habit.save();

    // Calculate coins
    const baseReward = habit.coinReward || CoinService.getBaseReward(habit.difficulty, 'habit');
    const streakBonus = CoinService.getStreakBonus(newStreak - 1); // Use previous streak for bonus
    const priorityBonus = CoinService.getPriorityBonus(habit.priority);
    const totalCoins = Math.floor(baseReward + streakBonus + priorityBonus);

    // Record completion
    const completion = new HabitCompletion({
      userId: req.userId,
      habitId: habit._id,
      coinsEarned: baseReward,
      streakBonus,
      priorityBonus,
      totalCoinsAwarded: totalCoins,
    });
    await completion.save();

    // Award coins
    const result = await CoinService.awardCoins(
      req.userId,
      totalCoins,
      'completion',
      habit._id,
      'habit',
      habit.title,
      `Completed habit: ${habit.title} (Streak: ${newStreak}, Bonus: ${streakBonus + priorityBonus})`
    );

    res.json({
      habit,
      coinsAwarded: {
        base: baseReward,
        streak: streakBonus,
        priority: priorityBonus,
        total: totalCoins,
      },
      newBalance: result.newBalance,
      streak: newStreak,
      message: 'Habit completed! Coins awarded.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark habit as incomplete/missed and apply penalty
router.post('/habits/:id/incomplete-missed', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    // Reset streak
    const oldStreak = habit.currentStreak || 0;
    habit.currentStreak = 0;
    habit.completionHistory.push({
      date: new Date(),
      completed: false,
    });
    await habit.save();

    // Apply penalty
    const penalty = CoinService.calculatePenalty(habit.difficulty);
    const result = await CoinService.awardCoins(
      req.userId,
      penalty,
      'penalty',
      habit._id,
      'habit',
      habit.title,
      `Missed habit: ${habit.title} (Lost ${oldStreak} day streak)`
    );

    res.json({
      habit,
      penaltyApplied: Math.abs(penalty),
      streakLost: oldStreak,
      newBalance: result.newBalance,
      message: 'Habit marked as missed. Penalty applied and streak reset.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get habit analytics
router.get('/habits/:id/analytics', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const completions = await HabitCompletion.find({ habitId: habit._id }).sort({ completedDate: -1 });

    const completionRate = habit.completionHistory.length > 0
      ? (habit.completionHistory.filter((c) => c.completed).length / habit.completionHistory.length) * 100
      : 0;

    res.json({
      habit,
      completions: completions.slice(0, 30), // Last 30
      totalCompletions: completions.length,
      completionRate: Math.round(completionRate),
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============== COIN ENDPOINTS ===============

// Get user coin balance
router.get('/coins/balance', auth, async (req, res) => {
  try {
    const balance = await CoinService.getUserBalance(req.userId);
    res.json(balance);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get coin transaction history
router.get('/coins/history', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    const history = await CoinService.getCoinHistory(req.userId, limit, skip);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get coin statistics
router.get('/coins/stats', auth, async (req, res) => {
  try {
    const stats = await CoinService.getCoinStats(req.userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============== ANALYTICS ENDPOINTS ===============

// Get analytics dashboard
router.get('/analytics/dashboard', auth, async (req, res) => {
  try {
    const dashboard = await HabitAnalyticsService.getAnalyticsDashboard(req.userId);
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get completion history
router.get('/analytics/completion-history', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = await HabitAnalyticsService.getCompletionHistory(req.userId, days);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get streak metrics
router.get('/analytics/streaks', auth, async (req, res) => {
  try {
    const metrics = await HabitAnalyticsService.getStreakMetrics(req.userId);
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============== PREDICTION ENDPOINTS ===============

// Get productivity score prediction
router.get('/predictions/productivity-score', auth, async (req, res) => {
  try {
    const prediction = await PredictionService.predictProductivityScore(req.userId);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get burnout risk prediction
router.get('/predictions/burnout-risk', auth, async (req, res) => {
  try {
    const prediction = await PredictionService.predictBurnoutRisk(req.userId);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get streak break chance prediction
router.get('/predictions/streak-break-chance', auth, async (req, res) => {
  try {
    const prediction = await PredictionService.predictStreakBreakChance(req.userId);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ideal focus hours prediction
router.get('/predictions/focus-hours', auth, async (req, res) => {
  try {
    const prediction = await PredictionService.getIdealFocusHours(req.userId);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get most productive days prediction
router.get('/predictions/productive-days', auth, async (req, res) => {
  try {
    const prediction = await PredictionService.getMostProductiveDays(req.userId);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all predictions
router.get('/predictions/all', auth, async (req, res) => {
  try {
    const predictions = await PredictionService.getAllPredictions(req.userId);
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
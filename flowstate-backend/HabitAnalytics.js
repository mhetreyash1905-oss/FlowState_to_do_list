import Habit from '../models/Habit.js';
import Task from '../models/Task.js';
import HabitCompletion from '../models/HabitCompletion.js';

/**
 * Get completion history for a user over last N days
 */
export const getCompletionHistory = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completions = await HabitCompletion.find({
      userId,
      completedDate: { $gte: startDate },
    }).sort({ completedDate: 1 });

    // Group by date
    const historyMap = {};
    completions.forEach((c) => {
      const dateStr = c.completedDate.toISOString().split('T')[0];
      historyMap[dateStr] = (historyMap[dateStr] || 0) + 1;
    });

    return historyMap;
  } catch (err) {
    console.error('Error getting completion history:', err);
    throw err;
  }
};

/**
 * Get completions grouped by hour of day
 */
export const getCompletionByHour = async (userId, days = 60) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completions = await HabitCompletion.find({
      userId,
      completedDate: { $gte: startDate },
    });

    const hourMap = {};
    for (let i = 0; i < 24; i++) {
      hourMap[i] = 0;
    }

    completions.forEach((c) => {
      const hour = new Date(c.completedDate).getHours();
      hourMap[hour]++;
    });

    return hourMap;
  } catch (err) {
    console.error('Error getting completion by hour:', err);
    throw err;
  }
};

/**
 * Get completions grouped by day of week
 */
export const getCompletionByDayOfWeek = async (userId, days = 60) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completions = await HabitCompletion.find({
      userId,
      completedDate: { $gte: startDate },
    });

    const dayMap = {
      0: { name: 'Sunday', count: 0 },
      1: { name: 'Monday', count: 0 },
      2: { name: 'Tuesday', count: 0 },
      3: { name: 'Wednesday', count: 0 },
      4: { name: 'Thursday', count: 0 },
      5: { name: 'Friday', count: 0 },
      6: { name: 'Saturday', count: 0 },
    };

    completions.forEach((c) => {
      const day = new Date(c.completedDate).getDay();
      dayMap[day].count++;
    });

    return dayMap;
  } catch (err) {
    console.error('Error getting completion by day of week:', err);
    throw err;
  }
};

/**
 * Get streak metrics
 */
export const getStreakMetrics = async (userId) => {
  try {
    const habits = await Habit.find({ userId });

    const metrics = {
      currentStreaks: [],
      longestStreaks: [],
      totalHabits: habits.length,
      averageStreak: 0,
      longestStreak: 0,
    };

    let totalStreak = 0;
    let maxStreak = 0;

    habits.forEach((habit) => {
      if (habit.currentStreak > 0) {
        metrics.currentStreaks.push({
          habitId: habit._id,
          habitName: habit.title,
          streak: habit.currentStreak,
        });
        totalStreak += habit.currentStreak;
      }

      if (habit.longestStreak > 0) {
        metrics.longestStreaks.push({
          habitId: habit._id,
          habitName: habit.title,
          streak: habit.longestStreak,
        });
        maxStreak = Math.max(maxStreak, habit.longestStreak);
      }
    });

    metrics.averageStreak = habits.length > 0 ? Math.round(totalStreak / habits.length) : 0;
    metrics.longestStreak = maxStreak;

    return metrics;
  } catch (err) {
    console.error('Error getting streak metrics:', err);
    throw err;
  }
};

/**
 * Get difficulty distribution of completed items
 */
export const getDifficultyTrends = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completions = await HabitCompletion.find({
      userId,
      completedDate: { $gte: startDate },
    });

    // Get habit difficulties
    const difficulties = {
      easy: 0,
      medium: 0,
      hard: 0,
      extreme: 0,
    };

    // This would require habit data, so fetch habits too
    const habits = await Habit.find({ userId });
    const habitMap = {};
    habits.forEach((h) => {
      habitMap[h._id.toString()] = h.difficulty;
    });

    completions.forEach((c) => {
      const difficulty = habitMap[c.habitId.toString()] || 'medium';
      difficulties[difficulty]++;
    });

    return difficulties;
  } catch (err) {
    console.error('Error getting difficulty trends:', err);
    throw err;
  }
};

/**
 * Get comprehensive analytics dashboard
 */
export const getAnalyticsDashboard = async (userId) => {
  try {
    const [
      completionHistory,
      completionByHour,
      completionByDay,
      streakMetrics,
      difficultyTrends,
    ] = await Promise.all([
      getCompletionHistory(userId, 30),
      getCompletionByHour(userId, 60),
      getCompletionByDayOfWeek(userId, 60),
      getStreakMetrics(userId),
      getDifficultyTrends(userId, 30),
    ]);

    return {
      completionHistory,
      completionByHour,
      completionByDay,
      streakMetrics,
      difficultyTrends,
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error('Error getting analytics dashboard:', err);
    throw err;
  }
};

export default {
  getCompletionHistory,
  getCompletionByHour,
  getCompletionByDayOfWeek,
  getStreakMetrics,
  getDifficultyTrends,
  getAnalyticsDashboard,
};

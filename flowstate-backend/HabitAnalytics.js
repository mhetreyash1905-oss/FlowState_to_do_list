import Habit from './models/Habit.js';
import Task from './models/Task.js';
import HabitCompletion from './models/HabitCompletion.js';

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
      habitGenome,
      habitCorrelation,
      smartRecommendations,
    ] = await Promise.all([
      getCompletionHistory(userId, 30),
      getCompletionByHour(userId, 60),
      getCompletionByDayOfWeek(userId, 60),
      getStreakMetrics(userId),
      getDifficultyTrends(userId, 30),
      calculateHabitGenome(userId),
      calculateHabitCorrelation(userId),
      generateSmartRecommendations(userId),
    ]);

    return {
      completionHistory,
      completionByHour,
      completionByDay,
      streakMetrics,
      difficultyTrends,
      habitGenome,
      habitCorrelation,
      smartRecommendations,
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error('Error getting analytics dashboard:', err);
    throw err;
  }
};

/**
 * Calculate Habit Genome Archetype
 */
export const calculateHabitGenome = async (userId) => {
  try {
    const days = 60;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completions = await HabitCompletion.find({
      userId,
      completedDate: { $gte: startDate },
    });

    const habits = await Habit.find({ userId });

    // If there is very little data, return a default "Consistency Monk" archetype or similar
    if (completions.length < 5) {
      return {
        archetype: 'Consistency Monk',
        name: 'Consistency Monk (In-Training)',
        description: 'You are beginning your journey towards absolute focus. Keep logging tasks to reveal your full habit genome.',
        avatar: '🧘',
        traits: ['Beginning', 'Patient', 'Focused'],
        stats: { nightCompletionsPct: 0, weekendCompletionsPct: 0, timeDeviation: 0, maxHourBurst: 0, highDiffPct: 0 },
        confidence: 'low'
      };
    }

    let nightCompletions = 0;
    const completionHours = [];
    completions.forEach((c) => {
      const date = new Date(c.completedDate);
      const hour = date.getHours();
      completionHours.push(hour);
      if (hour >= 21 || hour < 4) {
        nightCompletions++;
      }
    });

    const nightCompletionsPct = (nightCompletions / completions.length) * 100;

    let weekendCompletions = 0;
    completions.forEach((c) => {
      const day = new Date(c.completedDate).getDay();
      if (day === 0 || day === 6) {
        weekendCompletions++;
      }
    });

    const weekendCompletionsPct = (weekendCompletions / completions.length) * 100;

    // Consistency (standard deviation of hours)
    const meanHour = completionHours.reduce((a, b) => a + b, 0) / completionHours.length;
    const variance = completionHours.reduce((sum, h) => sum + Math.pow(h - meanHour, 2), 0) / completionHours.length;
    const timeDeviation = Math.sqrt(variance);

    // Burst factor (completions in same hour)
    const dateHourKeys = {};
    completions.forEach((c) => {
      const date = new Date(c.completedDate);
      const key = `${date.toISOString().split('T')[0]}-${date.getHours()}`;
      dateHourKeys[key] = (dateHourKeys[key] || 0) + 1;
    });
    const maxHourBurst = Object.values(dateHourKeys).length > 0 ? Math.max(...Object.values(dateHourKeys)) : 0;

    // High difficulty completions
    const habitMap = {};
    habits.forEach(h => { habitMap[h._id.toString()] = h.difficulty; });
    const highDiffCompletions = completions.filter(c => {
      const diff = habitMap[c.habitId.toString()];
      return diff === 'hard' || diff === 'extreme';
    }).length;
    const highDiffPct = (highDiffCompletions / completions.length) * 100;

    let archetype = 'Balanced Achiever';
    let name = 'Balanced Achiever';
    let description = 'You maintain a healthy, distributed habit routine, completing tasks with steady progress across days and times.';
    let avatar = '⚖️';
    let traits = ['Harmonious Flow', 'Steady Progress', 'Adaptable Schedule'];

    if (nightCompletionsPct >= 40) {
      archetype = 'Night Owl';
      name = 'Night Owl';
      description = 'You find your flow state when the rest of the world is asleep. Your peak performance occurs in the late evening and night hours.';
      avatar = '🦉';
      traits = ['Creativity Peak', 'Late Night Focus', 'Independent Work'];
    } else if (weekendCompletionsPct >= 45) {
      archetype = 'Weekend Warrior';
      name = 'Weekend Warrior';
      description = 'You use the weekend to catch up on personal goals and high-intensity tasks, balancing a busy weekday schedule.';
      avatar = '🛡️';
      traits = ['Weekend Clutch', 'High Momentum', 'Work-Life Divider'];
    } else if (timeDeviation <= 3.0 && completions.length >= 10) {
      archetype = 'Consistency Monk';
      name = 'Consistency Monk';
      description = 'You are the epitome of discipline. You complete your habits like clockwork, at almost the exact same time every day.';
      avatar = '🧘';
      traits = ['Unshakable Routine', 'Atomic Habits', 'Time-Disciplined'];
    } else if (maxHourBurst >= 3) {
      archetype = 'Sprint Worker';
      name = 'Sprint Worker';
      description = 'You work in intense, high-energy bursts. You prefer knocking out multiple tasks back-to-back, followed by longer recovery periods.';
      avatar = '🏃';
      traits = ['High-Speed Output', 'Task Batching', 'Laser Focus'];
    } else if (timeDeviation > 5.5 && highDiffPct > 25) {
      archetype = 'Chaotic Genius';
      name = 'Chaotic Genius';
      description = 'You lack a structured routine but possess an incredible ability to conquer complex, high-difficulty challenges whenever inspiration strikes.';
      avatar = '⚡';
      traits = ['Non-linear Workflow', 'Extreme Problem Solver', 'Inspiration-Driven'];
    }

    return {
      archetype,
      name,
      description,
      avatar,
      traits,
      stats: {
        nightCompletionsPct: Math.round(nightCompletionsPct),
        weekendCompletionsPct: Math.round(weekendCompletionsPct),
        timeDeviation: Math.round(timeDeviation * 10) / 10,
        maxHourBurst,
        highDiffPct: Math.round(highDiffPct),
      },
      confidence: completions.length >= 15 ? 'high' : 'medium',
      lastUpdated: new Date()
    };
  } catch (err) {
    console.error('Error calculating habit genome:', err);
    throw err;
  }
};

/**
 * Calculate Habit Correlation Matrix
 */
export const calculateHabitCorrelation = async (userId) => {
  try {
    const habits = await Habit.find({ userId });
    const completions = await HabitCompletion.find({ userId });

    // Group completions by habit
    const habitCompletionDates = {};
    habits.forEach(h => {
      habitCompletionDates[h._id.toString()] = new Set();
    });

    completions.forEach(c => {
      const habitIdStr = c.habitId.toString();
      if (habitCompletionDates[habitIdStr]) {
        const dateStr = new Date(c.completedDate).toISOString().split('T')[0];
        habitCompletionDates[habitIdStr].add(dateStr);
      }
    });

    const correlationMatrix = [];

    for (let i = 0; i < habits.length; i++) {
      for (let j = 0; j < habits.length; j++) {
        const habitA = habits[i];
        const habitB = habits[j];
        const datesA = habitCompletionDates[habitA._id.toString()];
        const datesB = habitCompletionDates[habitB._id.toString()];

        if (i === j) {
          correlationMatrix.push({
            habitAId: habitA._id,
            habitATitle: habitA.title,
            habitBId: habitB._id,
            habitBTitle: habitB.title,
            correlation: 100,
          });
          continue;
        }

        // Calculate Jaccard similarity
        let intersectionSize = 0;
        datesA.forEach(d => {
          if (datesB.has(d)) intersectionSize++;
        });

        const unionSize = datesA.size + datesB.size - intersectionSize;
        const similarity = unionSize > 0 ? (intersectionSize / unionSize) : 0;

        correlationMatrix.push({
          habitAId: habitA._id,
          habitATitle: habitA.title,
          habitBId: habitB._id,
          habitBTitle: habitB.title,
          correlation: Math.round(similarity * 100),
        });
      }
    }

    return correlationMatrix;
  } catch (err) {
    console.error('Error calculating habit correlation:', err);
    throw err;
  }
};

/**
 * Generate Smart Recommendations (Netflix for discipline)
 */
export const generateSmartRecommendations = async (userId) => {
  try {
    const habits = await Habit.find({ userId });
    const completions = await HabitCompletion.find({ userId }).sort({ completedDate: -1 });

    const recommendations = [];

    // 1. Optimal Timings Suggestion
    const hourMap = {};
    completions.forEach((c) => {
      const hour = new Date(c.completedDate).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    let peakHour = null;
    let maxCompletions = 0;
    Object.entries(hourMap).forEach(([hour, count]) => {
      if (count > maxCompletions) {
        maxCompletions = count;
        peakHour = parseInt(hour);
      }
    });

    if (peakHour !== null && habits.length > 0) {
      const peakRange = `${String(peakHour).padStart(2, '0')}:00-${String(peakHour).padStart(2, '0')}:59`;
      const randomHabit = habits[Math.floor(Math.random() * habits.length)];
      recommendations.push({
        type: 'timing',
        title: 'Optimize Schedule',
        description: `Your completions peak around ${peakRange}. Consider scheduling "${randomHabit.title}" during this high-energy window.`,
        metric: 'Optimal Time',
        impact: 'High',
      });
    }

    // 2. Habit Bundles / Stacking Suggestion
    // Find any pairs with correlation > 20%
    const correlation = await calculateHabitCorrelation(userId);
    const strongPair = correlation.find(c => c.correlation >= 20 && c.correlation < 100);

    if (strongPair) {
      recommendations.push({
        type: 'bundle',
        title: 'Habit Stacking',
        description: `Completing "${strongPair.habitATitle}" before "${strongPair.habitBTitle}" increases your synergy by ${strongPair.correlation}%. Try doing them back-to-back!`,
        metric: `+${strongPair.correlation}% Synergy`,
        impact: 'Very High',
      });
    } else {
      // Add default bundle / stacking
      recommendations.push({
        type: 'bundle',
        title: 'Habit Stacking',
        description: 'Meditation immediately before Coding increases your focus and raises coding completion rates by 22%.',
        metric: '+22% Success',
        impact: 'High',
      });
    }

    // 3. Easier Habits Suggestion
    const lowCompletionHabit = habits.find(h => {
      const total = h.completionHistory?.length || 0;
      const completed = h.completionHistory?.filter(c => c.completed).length || 0;
      return total >= 3 && (completed / total) < 0.5 && (h.difficulty === 'hard' || h.difficulty === 'extreme');
    });

    if (lowCompletionHabit) {
      recommendations.push({
        type: 'easier',
        title: 'Reduce Friction',
        description: `"${lowCompletionHabit.title}" has a completion rate of under 50% due to its high difficulty. Try breaking it down into an easier daily goal first.`,
        metric: 'Lower Friction',
        impact: 'Medium',
      });
    } else {
      recommendations.push({
        type: 'easier',
        title: 'Baby Steps',
        description: 'Struggling with a difficult habit? Try breaking it into a 5-minute easy version to build streak momentum.',
        metric: 'High Adherence',
        impact: 'Medium',
      });
    }

    // 4. Habit Replacements
    const strugglingHabit = habits.find(h => {
      const total = h.completionHistory?.length || 0;
      const completed = h.completionHistory?.filter(c => c.completed).length || 0;
      return total >= 3 && (completed / total) < 0.3;
    });

    if (strugglingHabit) {
      let replacement = 'a simpler daily task';
      if (strugglingHabit.title.toLowerCase().includes('run')) replacement = 'a 15-minute walk';
      else if (strugglingHabit.title.toLowerCase().includes('workout')) replacement = 'a quick stretching session';
      else if (strugglingHabit.title.toLowerCase().includes('read')) replacement = 'reading just 2 pages';

      recommendations.push({
        type: 'replacement',
        title: 'Discipline Replacement',
        description: `You are struggling to maintain "${strugglingHabit.title}". Try replacing it with "${replacement}" to keep your discipline streak alive.`,
        metric: 'Streak Rescue',
        impact: 'Medium',
      });
    } else {
      recommendations.push({
        type: 'replacement',
        title: 'Replace and Pivot',
        description: 'If a habit does not fit your schedule after 2 weeks, swap it out for a low-barrier alternative instead of breaking your streak.',
        metric: 'Pivot Ready',
        impact: 'Low',
      });
    }

    return recommendations;
  } catch (err) {
    console.error('Error generating recommendations:', err);
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
  calculateHabitGenome,
  calculateHabitCorrelation,
  generateSmartRecommendations,
};

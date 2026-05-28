import HabitCompletion from './models/HabitCompletion.js';
import Habit from './models/Habit.js';

/**
 * Calculate productivity score for tomorrow (0-100)
 * Based on 14-day moving average with weighted factors
 */
export const predictProductivityScore = async (userId) => {
  try {
    const days = 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completions = await HabitCompletion.find({
      userId,
      completedDate: { $gte: startDate },
    });

    const habits = await Habit.find({ userId });
    const totalHabits = habits.length || 1;

    // Calculate daily completion rate
    const dailyCompletions = {};
    completions.forEach((c) => {
      const dateStr = c.completedDate.toISOString().split('T')[0];
      dailyCompletions[dateStr] = (dailyCompletions[dateStr] || 0) + 1;
    });

    // Calculate moving average
    const completionRates = Object.values(dailyCompletions);
    const averageCompletionsPerDay = completionRates.length > 0 
      ? completionRates.reduce((a, b) => a + b) / completionRates.length
      : 0;

    const completionPercentage = (averageCompletionsPerDay / totalHabits) * 100;

    // Factor in difficulty distribution
    let difficultyScore = 0;
    const difficultyMap = { easy: 1, medium: 2, hard: 3, extreme: 4 };
    const totalDifficulty = habits.reduce((sum, h) => sum + (difficultyMap[h.difficulty] || 2), 0);
    difficultyScore = Math.min((totalDifficulty / habits.length / 4) * 30, 30); // Max +30 for high difficulty

    // Factor in current streaks
    let streakScore = 0;
    const activeStreaks = habits.filter((h) => (h.currentStreak || 0) > 0).length;
    streakScore = (activeStreaks / totalHabits) * 20; // Max +20 for all habits on streak

    // Calculate final score
    const baseScore = Math.min(completionPercentage, 70); // Cap completion at 70
    const tomorrowScore = Math.round(baseScore + difficultyScore + streakScore);

    return {
      score: Math.min(tomorrowScore, 100), // Cap at 100
      baseCompletionRate: Math.round(completionPercentage),
      difficultyBonus: Math.round(difficultyScore),
      streakBonus: Math.round(streakScore),
      confidence: completionRates.length >= 7 ? 'high' : completionRates.length >= 3 ? 'medium' : 'low',
      daysAnalyzed: completionRates.length,
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error('Error predicting productivity score:', err);
    throw err;
  }
};

/**
 * Calculate burnout probability (0-100%)
 */
export const predictBurnoutRisk = async (userId) => {
  try {
    const habits = await Habit.find({ userId });
    const completions = await HabitCompletion.find({ userId }).sort({ completedDate: -1 }).limit(30);

    let riskScore = 0;

    // Risk Factor 1: Long streaks (> 30 days high risk)
    const longStreaks = habits.filter((h) => (h.currentStreak || 0) > 30).length;
    riskScore += longStreaks * 15;

    // Risk Factor 2: 100% completion rate (unsustainable)
    const perfectHabits = habits.filter((h) => {
      const total = h.completionHistory?.length || 0;
      const completed = h.completionHistory?.filter((c) => c.completed).length || 0;
      return total > 0 && completed === total;
    }).length;
    riskScore += perfectHabits * 20;

    // Risk Factor 3: High difficulty concentration
    const extremeDifficulty = habits.filter((h) => h.difficulty === 'extreme').length;
    riskScore += extremeDifficulty * 10;

    // Risk Factor 4: No recent breaks in streaks
    const recentlyBroken = completions.filter((c) => !c.completedDate).length;
    if (recentlyBroken === 0 && completions.length > 14) {
      riskScore += 15; // No breaks in last 2 weeks
    }

    // Protective Factor 1: Regular rest days
    const completionDays = completions.length;
    if (completionDays < 20 && completions.length > 7) {
      riskScore -= 10; // Has rest days
    }

    return {
      burnoutRisk: Math.max(0, Math.min(riskScore, 100)),
      status: riskScore > 70 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 30 ? 'moderate' : 'low',
      riskFactors: {
        longStreaks,
        perfectHabits,
        extremeDifficulty,
        noRecentBreaks: recentlyBroken === 0,
      },
      recommendations: generateBurnoutRecommendations(riskScore),
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error('Error predicting burnout risk:', err);
    throw err;
  }
};

/**
 * Calculate probability of breaking current streak tomorrow (0-100%)
 */
export const predictStreakBreakChance = async (userId) => {
  try {
    const habits = await Habit.find({ userId });
    const completions = await HabitCompletion.find({ userId }).sort({ completedDate: -1 }).limit(60);

    const predictions = habits.map((habit) => {
      let breakChance = 30; // Base 30% chance

      // Factor 1: Current streak length (longer = more likely to break)
      const streak = habit.currentStreak || 0;
      if (streak > 14) breakChance += 20;
      else if (streak > 7) breakChance += 10;
      else if (streak > 3) breakChance += 5;

      // Factor 2: Historical break patterns
      const habitCompletions = completions.filter((c) => c.habitId.toString() === habit._id.toString());
      if (habitCompletions.length >= 10) {
        const recentMisses = habitCompletions.slice(0, 10).filter((c) => !c.totalCoinsAwarded).length;
        breakChance += (recentMisses / 10) * 30; // Scale by historical miss rate
      }

      // Factor 3: Difficulty (harder = more likely to break)
      const difficultyMap = { easy: 0, medium: 10, hard: 20, extreme: 30 };
      breakChance += difficultyMap[habit.difficulty] || 10;

      // Factor 4: Time of day patterns
      const hourCompletions = habitCompletions.reduce((acc, c) => {
        const hour = new Date(c.completedDate).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      const avgHour = Object.keys(hourCompletions).length > 0
        ? Object.keys(hourCompletions).reduce((sum, h) => sum + parseInt(h), 0) / Object.keys(hourCompletions).length
        : 12;

      // Check if it's their typical completion time now
      const currentHour = new Date().getHours();
      if (Math.abs(currentHour - avgHour) > 6) {
        breakChance += 15; // Outside typical time = higher break risk
      }

      return {
        habitId: habit._id,
        habitTitle: habit.title,
        breakChance: Math.min(breakChance, 99),
        currentStreak: streak,
        difficulty: habit.difficulty,
        historicalBreakRate: habitCompletions.length >= 10
          ? Math.round((habitCompletions.slice(0, 10).filter((c) => !c.totalCoinsAwarded).length / 10) * 100)
          : null,
      };
    });

    const averageBreakChance = predictions.length > 0
      ? Math.round(predictions.reduce((sum, p) => sum + p.breakChance, 0) / predictions.length)
      : 0;

    return {
      averageBreakChance,
      habitPredictions: predictions,
      highestRiskHabit: predictions.length > 0
        ? predictions.reduce((max, p) => p.breakChance > max.breakChance ? p : max)
        : null,
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error('Error predicting streak break chance:', err);
    throw err;
  }
};

/**
 * Get ideal focus hours based on completion patterns
 */
export const getIdealFocusHours = async (userId) => {
  try {
    const days = 60;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completions = await HabitCompletion.find({
      userId,
      completedDate: { $gte: startDate },
    });

    // Group by hour
    const hourMap = {};
    for (let i = 0; i < 24; i++) {
      hourMap[i] = { completions: 0, attempts: 24 }; // Rough estimate of attempts
    }

    completions.forEach((c) => {
      const hour = new Date(c.completedDate).getHours();
      hourMap[hour].completions++;
    });

    // Calculate completion rate per hour
    const hourlyRates = Object.entries(hourMap)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        completions: data.completions,
        rate: data.attempts > 0 ? (data.completions / data.attempts) * 100 : 0,
      }))
      .sort((a, b) => b.rate - a.rate);

    // Get top 5 hours with >50% completion rate
    const peakHours = hourlyRates
      .filter((h) => h.completions >= 2) // Minimum 2 completions to count
      .slice(0, 5)
      .map((h) => ({
        hour: h.hour,
        timeRange: `${String(h.hour).padStart(2, '0')}:00-${String(h.hour).padStart(2, '0')}:59`,
        completions: h.completions,
        completionRate: Math.round(h.rate),
      }));

    return {
      idealHours: peakHours.length > 0 ? peakHours : hourlyRates.slice(0, 5),
      recommendation: generateFocusHoursRecommendation(peakHours),
      daysAnalyzed: days,
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error('Error getting ideal focus hours:', err);
    throw err;
  }
};

/**
 * Get most productive days of week
 */
export const getMostProductiveDays = async (userId) => {
  try {
    const days = 60;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completions = await HabitCompletion.find({
      userId,
      completedDate: { $gte: startDate },
    });

    const habits = await Habit.find({ userId });

    const dayMap = {
      0: { name: 'Sunday', completions: 0, score: 0 },
      1: { name: 'Monday', completions: 0, score: 0 },
      2: { name: 'Tuesday', completions: 0, score: 0 },
      3: { name: 'Wednesday', completions: 0, score: 0 },
      4: { name: 'Thursday', completions: 0, score: 0 },
      5: { name: 'Friday', completions: 0, score: 0 },
      6: { name: 'Saturday', completions: 0, score: 0 },
    };

    // Count completions and calculate difficulty-weighted score
    completions.forEach((c) => {
      const day = new Date(c.completedDate).getDay();
      dayMap[day].completions++;
      // Get habit difficulty for weighted scoring
      const habit = habits.find((h) => h._id.toString() === c.habitId.toString());
      const difficultyScore = { easy: 1, medium: 2, hard: 3, extreme: 4 }[habit?.difficulty] || 2;
      dayMap[day].score += difficultyScore;
    });

    const sortedDays = Object.values(dayMap)
      .map((d) => ({
        day: d.name,
        completions: d.completions,
        productivityScore: d.score,
        avgDifficultyPerDay: d.completions > 0 ? Math.round(d.score / d.completions * 100) / 100 : 0,
      }))
      .sort((a, b) => b.productivityScore - a.productivityScore);

    return {
      rankedDays: sortedDays,
      bestDay: sortedDays.length > 0 ? sortedDays[0] : null,
      worstDay: sortedDays.length > 0 ? sortedDays[sortedDays.length - 1] : null,
      recommendation: generateProductiveDaysRecommendation(sortedDays),
      daysAnalyzed: days,
      lastUpdated: new Date(),
    };
  } catch (err) {
    console.error('Error getting most productive days:', err);
    throw err;
  }
};

/**
 * Get all predictions combined
 */
export const getAllPredictions = async (userId) => {
  try {
    const [
      productivityScore,
      burnoutRisk,
      streakBreakChance,
      idealHours,
      productiveDays,
    ] = await Promise.all([
      predictProductivityScore(userId),
      predictBurnoutRisk(userId),
      predictStreakBreakChance(userId),
      getIdealFocusHours(userId),
      getMostProductiveDays(userId),
    ]);

    return {
      productivityScore,
      burnoutRisk,
      streakBreakChance,
      idealHours,
      productiveDays,
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error('Error getting all predictions:', err);
    throw err;
  }
};

// Helper functions for recommendations
function generateBurnoutRecommendations(riskScore) {
  if (riskScore > 70) {
    return [
      '⚠️ Critical burnout risk - Consider taking a break',
      '📉 Reduce difficulty of some habits',
      '😴 Schedule at least 1-2 rest days per week',
      '⏰ Take longer recovery periods between habits',
    ];
  }
  if (riskScore > 50) {
    return [
      '⚡ Moderate burnout risk - Be mindful',
      '💡 Mix in some easy wins',
      '🎯 Focus on quality over quantity',
    ];
  }
  return [
    '✨ Good balance maintained',
    '🎯 Keep up the sustainable pace',
  ];
}

function generateFocusHoursRecommendation(peakHours) {
  if (peakHours.length === 0) return ['Schedule habits during morning or afternoon'];
  const topHours = peakHours.map((h) => h.timeRange).join(', ');
  return [`Your peak productivity hours: ${topHours}`, 'Schedule important habits during these times'];
}

function generateProductiveDaysRecommendation(sortedDays) {
  if (sortedDays.length === 0) return ['Track more habits to get day analysis'];
  const bestDay = sortedDays[0];
  const worstDay = sortedDays[sortedDays.length - 1];
  return [
    `Your most productive day is ${bestDay.day} (Score: ${bestDay.productivityScore})`,
    `${worstDay.day} is your least productive day (Score: ${worstDay.productivityScore})`,
    `Plan challenging tasks for ${bestDay.day}s`,
  ];
}

export default {
  predictProductivityScore,
  predictBurnoutRisk,
  predictStreakBreakChance,
  getIdealFocusHours,
  getMostProductiveDays,
  getAllPredictions,
};

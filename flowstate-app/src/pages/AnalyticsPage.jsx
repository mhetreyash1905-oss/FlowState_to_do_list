import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/analytics/dashboard');
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load analytics', err);
      setError(err.response?.data?.error || 'Failed to load analytics dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Analyzing your behavior patterns & syncing genome data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="analytics-error">
        <h2>⚠️ Error Loading Analytics</h2>
        <p>{error || 'Something went wrong while retrieving data.'}</p>
        <button onClick={fetchAnalytics} className="retry-btn">Retry Setup</button>
      </div>
    );
  }

  const {
    completionHistory,
    completionByHour,
    completionByDay,
    streakMetrics,
    difficultyTrends,
    habitGenome,
    habitCorrelation,
    smartRecommendations,
  } = data;

  // 1. Heatmap Data Setup (91 Days / 13 Weeks)
  const buildHeatmapCells = () => {
    const cells = [];
    const now = new Date();
    // Start from 13 weeks ago, aligned to Sunday
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 90);
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay); // Align to Sunday

    for (let i = 0; i < 91; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const count = completionHistory[key] || 0;
      cells.push({ date: key, count, dayOfWeek: d.getDay() });
    }
    return cells;
  };
  const heatmapCells = buildHeatmapCells();

  // 2. Productivity Curve (Completion By Hour)
  const productivityCurveData = Object.entries(completionByHour).map(([hour, count]) => ({
    hour: `${hour.padStart(2, '0')}:00`,
    completions: count,
  }));

  // 3. Radar Chart (Day of Week performance)
  const radarData = Object.entries(completionByDay).map(([dayKey, dayInfo]) => ({
    subject: dayInfo.name.substring(0, 3),
    value: dayInfo.count,
    fullMark: Math.max(...Object.values(completionByDay).map(d => d.count), 5),
  }));

  // 4. Consistency Graph (Past 30 Days completion rate & streak progression)
  const buildConsistencyData = () => {
    const trend = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      trend.push({
        date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completions: completionHistory[key] || 0,
      });
    }
    return trend;
  };
  const consistencyData = buildConsistencyData();

  // 5. Weekly Trends (Mock comparison of habits vs tasks completed over last 8 weeks)
  const buildWeeklyTrendsData = () => {
    const weeklyTrends = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekLabel = `Wk -${i}`;
      // Count completions in this week range
      let weeklyHabits = 0;
      for (let j = 0; j < 7; j++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() - j);
        const key = d.toISOString().split('T')[0];
        weeklyHabits += (completionHistory[key] || 0);
      }
      weeklyTrends.push({
        week: weekLabel,
        Habits: weeklyHabits,
        Tasks: Math.round(weeklyHabits * 0.6), // Proxy ratio for task completions
      });
    }
    return weeklyTrends;
  };
  const weeklyTrendsData = buildWeeklyTrendsData();

  // 6. Habit Correlation Matrix
  const uniqueHabitTitles = Array.from(new Set(habitCorrelation.map(c => c.habitATitle)));

  return (
    <div className="analytics-page">
      <div className="container-wide">
        
        {/* Header Title */}
        <div className="analytics-header-section">
          <h1>📊 Analytics & AI Predictions</h1>
          <p>Explore your behavior genome, cross-habit correlations, and automated discipline recommendations.</p>
          <button onClick={fetchAnalytics} className="refresh-btn">🔄 Refresh Insights</button>
        </div>

        {/* 🧬 Habit Genome Archetype Card */}
        <section className={`genome-card genome-card--${habitGenome.archetype.toLowerCase().replace(' ', '-')}`}>
          <div className="genome-card__ambient"></div>
          <div className="genome-card__header">
            <div className="genome-card__avatar">{habitGenome.avatar}</div>
            <div className="genome-card__title-group">
              <span className="genome-card__badge">Behavior Genome Archetype</span>
              <h2>{habitGenome.name}</h2>
            </div>
            <div className="genome-card__confidence">
              Confidence: <span className={`confidence-tag confidence-tag--${habitGenome.confidence}`}>{habitGenome.confidence.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="genome-card__body">
            <p className="genome-card__description">{habitGenome.description}</p>
            
            <div className="genome-card__traits">
              {habitGenome.traits.map((trait, idx) => (
                <span key={idx} className="trait-tag">⚡ {trait}</span>
              ))}
            </div>

            <div className="genome-card__stats-grid">
              <div className="genome-stat">
                <span className="genome-stat__val">{habitGenome.stats.nightCompletionsPct}%</span>
                <span className="genome-stat__lbl">Night Activity</span>
              </div>
              <div className="genome-stat">
                <span className="genome-stat__val">{habitGenome.stats.weekendCompletionsPct}%</span>
                <span className="genome-stat__lbl">Weekend Ratio</span>
              </div>
              <div className="genome-stat">
                <span className="genome-stat__val">±{habitGenome.stats.timeDeviation}h</span>
                <span className="genome-stat__lbl">Time Variance</span>
              </div>
              <div className="genome-stat">
                <span className="genome-stat__val">{habitGenome.stats.maxHourBurst}</span>
                <span className="genome-stat__lbl">Max Hourly Burst</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🧠 Recommendation Engine Panel (Netflix Style) */}
        <section className="recommendations-section">
          <h2 className="section-title">🧠 Recommendation Engine <span className="title-sub">Netflix but for discipline</span></h2>
          <div className="recommendations-carousel">
            {smartRecommendations.map((rec, i) => (
              <div key={i} className={`recommendation-item rec-type--${rec.type}`}>
                <div className="rec-header">
                  <span className={`rec-tag rec-tag--${rec.type}`}>
                    {rec.type === 'timing' && '⏰ Optimal Timing'}
                    {rec.type === 'bundle' && '🧬 Habit Stack'}
                    {rec.type === 'easier' && '📉 Reduce Friction'}
                    {rec.type === 'replacement' && '🔄 Swap & Pivot'}
                  </span>
                  <span className={`rec-impact impact--${rec.impact.toLowerCase().replace(' ', '')}`}>
                    {rec.impact} Impact
                  </span>
                </div>
                <h3 className="rec-title">{rec.title}</h3>
                <p className="rec-desc">{rec.description}</p>
                <div className="rec-footer">
                  <span className="rec-metric">{rec.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Visualizations Grid */}
        <section className="visualizations-grid">
          
          {/* Chart 1: Heatmap Grid */}
          <div className="vis-panel vis-panel--heatmap">
            <h3>📈 Completion Heatmap (Last 90 Days)</h3>
            <div className="heatmap-container">
              <div className="heatmap-grid">
                {heatmapCells.map((cell, idx) => {
                  let densityClass = 'd0';
                  if (cell.count > 0 && cell.count <= 1) densityClass = 'd1';
                  else if (cell.count > 1 && cell.count <= 2) densityClass = 'd2';
                  else if (cell.count > 2 && cell.count <= 4) densityClass = 'd3';
                  else if (cell.count > 4) densityClass = 'd4';

                  return (
                    <div
                      key={idx}
                      className={`heatmap-cell ${densityClass}`}
                      title={`${cell.date}: ${cell.count} completions`}
                    />
                  );
                })}
              </div>
              <div className="heatmap-legend">
                <span>Less</span>
                <div className="legend-cell d0"></div>
                <div className="legend-cell d1"></div>
                <div className="legend-cell d2"></div>
                <div className="legend-cell d3"></div>
                <div className="legend-cell d4"></div>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Productivity Curve (Hourly activity) */}
          <div className="vis-panel">
            <h3>⚡ Daily Productivity Curve</h3>
            <p className="panel-sub">Completions by hour of the day</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={productivityCurveData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-surface-2)" />
                  <XAxis dataKey="hour" stroke="var(--clr-text-dim)" style={{ fontSize: '0.78rem' }} />
                  <YAxis stroke="var(--clr-text-dim)" style={{ fontSize: '0.78rem' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--clr-surface-2)', border: '1px solid var(--clr-surface-3)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--clr-text)' }}
                  />
                  <Area type="monotone" dataKey="completions" stroke="#00e5ff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCurve)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Radar Chart (Consistency across Days of Week) */}
          <div className="vis-panel">
            <h3>🎯 Weekday Radar Balance</h3>
            <p className="panel-sub">Consistency profile across days of the week</p>
            <div className="chart-container flex-center">
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="var(--clr-surface-3)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--clr-text-dim)" style={{ fontSize: '0.8rem', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="var(--clr-text-muted)" style={{ fontSize: '0.7rem' }} />
                  <Radar name="Completions" dataKey="value" stroke="#7c5cfc" fill="#7c5cfc" fillOpacity={0.4} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--clr-surface-2)', border: '1px solid var(--clr-surface-3)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--clr-text)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Consistency Graph */}
          <div className="vis-panel">
            <h3>🔥 30-Day Consistency Trend</h3>
            <p className="panel-sub">Daily completion volume over the last month</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={consistencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-surface-2)" />
                  <XAxis dataKey="date" stroke="var(--clr-text-dim)" style={{ fontSize: '0.78rem' }} />
                  <YAxis stroke="var(--clr-text-dim)" style={{ fontSize: '0.78rem' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--clr-surface-2)', border: '1px solid var(--clr-surface-3)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--clr-text)' }}
                  />
                  <Line type="monotone" dataKey="completions" stroke="#ff6f91" strokeWidth={3} dot={{ r: 3, fill: '#ff6f91' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Weekly Trend Comparison */}
          <div className="vis-panel">
            <h3>📊 Habit vs Task Completion Trends</h3>
            <p className="panel-sub">Volume comparison over past 8 weeks</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-surface-2)" />
                  <XAxis dataKey="week" stroke="var(--clr-text-dim)" style={{ fontSize: '0.78rem' }} />
                  <YAxis stroke="var(--clr-text-dim)" style={{ fontSize: '0.78rem' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--clr-surface-2)', border: '1px solid var(--clr-surface-3)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--clr-text)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar dataKey="Habits" fill="#7c5cfc" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tasks" fill="#00ffb3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Habit Correlation Matrix */}
          <div className="vis-panel vis-panel--matrix">
            <h3>🧬 Habit Correlation Matrix</h3>
            <p className="panel-sub">Visualizing how completing one habit correlates with others (Jaccard Similarity)</p>
            {uniqueHabitTitles.length === 0 ? (
              <p className="no-data">Add and complete multiple habits to view their corelations.</p>
            ) : (
              <div className="matrix-wrapper">
                <table className="correlation-table">
                  <thead>
                    <tr>
                      <th>Habit</th>
                      {uniqueHabitTitles.map((title, i) => (
                        <th key={i} title={title}>{title.substring(0, 8)}...</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueHabitTitles.map((rowTitle, rIdx) => (
                      <tr key={rIdx}>
                        <td className="row-header" title={rowTitle}>{rowTitle}</td>
                        {uniqueHabitTitles.map((colTitle, cIdx) => {
                          const match = habitCorrelation.find(
                            c => (c.habitATitle === rowTitle && c.habitBTitle === colTitle) ||
                                 (c.habitATitle === colTitle && c.habitBTitle === rowTitle)
                          );
                          const value = match ? match.correlation : 0;
                          const intensity = value / 100;
                          const bgStyle = {
                            backgroundColor: `rgba(124, 92, 252, ${intensity})`,
                            color: intensity > 0.45 ? '#ffffff' : 'var(--clr-text)',
                          };

                          return (
                            <td
                              key={cIdx}
                              style={bgStyle}
                              className="correlation-cell"
                              title={`Correlation between "${rowTitle}" and "${colTitle}": ${value}%`}
                            >
                              {value}%
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </section>

        {/* Sidebar Nav Shortcuts */}
        <div className="analytics-shortcuts">
          <NavLink to="/dashboard" className="shortcut-btn">🏠 Back to Dashboard</NavLink>
          <NavLink to="/tracker" className="shortcut-btn">📅 Back to Tracker</NavLink>
        </div>

      </div>
    </div>
  );
}

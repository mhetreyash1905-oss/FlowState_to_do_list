import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './PredictionsDashboard.css';

const PredictionsDashboard = ({ token }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPredictions();
  }, [token]);

  const fetchPredictions = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/user/predictions/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPredictions(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="predictions-container loading">Loading predictions...</div>;
  if (error) return <div className="predictions-container error">{error}</div>;
  if (!predictions) return null;

  const { productivityScore, burnoutRisk, streakBreakChance, idealHours, productiveDays } = predictions;

  // Prepare chart data
  const focusHoursData = (idealHours?.idealHours || []).map((h) => ({
    time: h.timeRange,
    rate: h.completionRate,
  }));

  const productiveDaysData = (productiveDays?.rankedDays || []).map((d) => ({
    day: d.day,
    score: d.productivityScore,
  }));

  return (
    <div className="predictions-container">
      <div className="predictions-header">
        <h1>🔮 AI Productivity Insights</h1>
        <button onClick={fetchPredictions} className="refresh-btn">Refresh</button>
      </div>

      <div className="predictions-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'focus' ? 'active' : ''}`}
          onClick={() => setActiveTab('focus')}
        >
          Focus Hours
        </button>
        <button
          className={`tab ${activeTab === 'days' ? 'active' : ''}`}
          onClick={() => setActiveTab('days')}
        >
          Productive Days
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="predictions-overview">
          {/* Productivity Score Card */}
          <div className="prediction-card productivity">
            <h3>📊 Tomorrow's Productivity</h3>
            <div className="score-display">
              <div className="score-value">{productivityScore.score}</div>
              <div className="score-unit">/100</div>
            </div>
            <div className="score-breakdown">
              <div className="breakdown-item">
                <span>Base Completion</span>
                <span>{productivityScore.baseCompletionRate}%</span>
              </div>
              <div className="breakdown-item">
                <span>Difficulty Bonus</span>
                <span>+{productivityScore.difficultyBonus}</span>
              </div>
              <div className="breakdown-item">
                <span>Streak Bonus</span>
                <span>+{productivityScore.streakBonus}</span>
              </div>
            </div>
            <div className={`confidence ${productivityScore.confidence}`}>
              Confidence: {productivityScore.confidence.toUpperCase()}
            </div>
          </div>

          {/* Burnout Risk Card */}
          <div className={`prediction-card burnout ${burnoutRisk.status}`}>
            <h3>⚠️ Burnout Risk</h3>
            <div className="risk-display">
              <div className="risk-value">{burnoutRisk.burnoutRisk}%</div>
              <div className={`risk-status ${burnoutRisk.status}`}>{burnoutRisk.status.toUpperCase()}</div>
            </div>
            <div className="recommendations">
              {burnoutRisk.recommendations.map((rec, i) => (
                <p key={i}>{rec}</p>
              ))}
            </div>
          </div>

          {/* Streak Break Chance Card */}
          <div className="prediction-card streak-break">
            <h3>🔥 Streak Break Chance</h3>
            <div className="break-display">
              <div className="break-value">{streakBreakChance.averageBreakChance}%</div>
              <div className="break-text">average across all habits</div>
            </div>
            {streakBreakChance.highestRiskHabit && (
              <div className="highest-risk">
                <p className="risk-label">Highest Risk Habit:</p>
                <p className="risk-habit">{streakBreakChance.highestRiskHabit.habitTitle}</p>
                <p className="risk-percent">{streakBreakChance.highestRiskHabit.breakChance}% chance</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'focus' && (
        <div className="predictions-focus">
          <h2>🎯 Your Peak Productivity Hours</h2>
          {focusHoursData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={focusHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#8884d8" name="Completion Rate %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="focus-recommendations">
                {idealHours.recommendation.map((rec, i) => (
                  <p key={i}>💡 {rec}</p>
                ))}
              </div>
            </>
          ) : (
            <p>Not enough data to analyze focus hours. Complete more habits to see patterns.</p>
          )}
        </div>
      )}

      {activeTab === 'days' && (
        <div className="predictions-days">
          <h2>📅 Most Productive Days</h2>
          {productiveDaysData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productiveDaysData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#82ca9d" name="Productivity Score" />
                </BarChart>
              </ResponsiveContainer>
              <div className="days-recommendations">
                {productiveDays.recommendation.map((rec, i) => (
                  <p key={i}>💡 {rec}</p>
                ))}
              </div>
            </>
          ) : (
            <p>Not enough data to analyze productive days. Track more habits to see patterns.</p>
          )}
        </div>
      )}

      <div className="predictions-footer">
        <small>🔄 Predictions update every 24 hours</small>
        <small>📊 Based on 30-60 days of completion data</small>
      </div>
    </div>
  );
};

export default PredictionsDashboard;

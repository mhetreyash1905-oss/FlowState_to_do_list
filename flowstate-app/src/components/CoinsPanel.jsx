import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CoinsPanel.css';

const CoinsPanel = ({ token }) => {
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoinData();
    const interval = setInterval(fetchCoinData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [token]);

  const fetchCoinData = async () => {
    try {
      const [balanceRes, statsRes] = await Promise.all([
        axios.get('http://localhost:4000/api/user/coins/balance', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:4000/api/user/coins/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBalance(balanceRes.data.coins);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load coins');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="coins-panel loading">Loading...</div>;
  if (error) return <div className="coins-panel error">{error}</div>;

  return (
    <div className="coins-panel">
      <div className="coins-header">
        <h2>💰 Coins</h2>
        <div className="coin-balance">
          <span className="coin-value">{balance}</span>
          <span className="coin-unit">🪙</span>
        </div>
      </div>

      {stats && (
        <div className="coins-stats">
          <div className="stat-row">
            <span className="stat-label">Total Earned</span>
            <span className="stat-value earned">+{stats.totalEarned}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Penalized</span>
            <span className="stat-value penalized">-{stats.totalPenalized}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Net Balance</span>
            <span className="stat-value net">{stats.netBalance}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{stats.transactionCount}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Avg per Transaction</span>
            <span className="stat-value">{stats.averageCoinsPerTransaction}</span>
          </div>
        </div>
      )}

      <button className="view-history-btn" onClick={() => window.location.href = '/coin-history'}>
        View History →
      </button>
    </div>
  );
};

export default CoinsPanel;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CoinDisplay.css';

export const CoinDisplay = ({ balance, showAnimation = false }) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(showAnimation);

  useEffect(() => {
    if (showAnimation) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  return (
    <div className={`coin-display ${isAnimating ? 'animate' : ''}`}>
      <span className="coin-icon">🪙</span>
      <span className="coin-amount">{displayBalance}</span>
    </div>
  );
};

export default CoinDisplay;

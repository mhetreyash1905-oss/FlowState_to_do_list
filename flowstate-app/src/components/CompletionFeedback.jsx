import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompletionFeedback.css';

const CompletionFeedback = ({ coinReward, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="completion-feedback">
      <div className="feedback-content">
        <span className="feedback-icon">✨</span>
        <div className="feedback-text">
          <p className="feedback-title">Great Job!</p>
          <p className="feedback-coins">
            +{coinReward} <span className="coin-emoji">🪙</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletionFeedback;

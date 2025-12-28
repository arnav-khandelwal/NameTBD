import React, { useState } from "react";
import "./landingPage.css";

export default function landingPage({ onStart, handActive, onFreePlayStart }) {
  const [showCampaign, setShowCampaign] = useState(false);

  // Mock leaderboard data based on the image
  const leaderboard = [
    { name: "SANTA_SLAYER", score: 2500 },
    { name: "ELF_HUNTER", score: 1800 },
  ];

  // Generate level grid (1-20)
  const levels = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleGoBack = () => {
    setShowCampaign(false);
  };

  return (
    <div className="landing-wrapper">
      {/* Snowfall background effect */}
      <div className="snow-container">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="snowflake">❄</div>
        ))}
      </div>

      {/* Top Header Tags */}
      <div className="header-tags">
        <div className="tag-box">v0.0.0</div>
        <div className="tag-box gold-text">CHRISTMAS SPECIAL</div>
      </div>

      <div className="main-layout">
        {/* Left: Controls */}
        <div className="side-container controls">
          <h2 className="container-title">CONTROLS</h2>
          <div className="control-group">
            <span className="control-label">AIM</span>
            <div className="control-desc">🖐️ Open Hand</div>
          </div>
          <div className="control-group">
            <span className="control-label">FIRE</span>
            <div className="control-desc">🤏 Pinch Thumb</div>
          </div>
        </div>

        {/* Center: Main Game UI */}
        <div className="center-box">
          {showCampaign && (
            <button className="go-back-btn" onClick={handleGoBack}>
              ← BACK
            </button>
          )}
          
          <h1 className={`game-logo ${showCampaign ? 'compact' : ''}`}>BEATFALL</h1>
          
          {!showCampaign ? (
            <div className="button-wrapper">
              <button 
                className="mode-button campaign-btn"
                onClick={() => setShowCampaign(true)}
              >
                CAMPAIGN
              </button>
              <button 
                className="mode-button freeplay-btn"
                onClick={onFreePlayStart}
              >
                FREEPLAY
              </button>
            </div>
          ) : (
            <div className="level-grid">
              {levels.map((level) => (
                <div key={level} className="level-box locked">
                  <div className="level-number">{level}</div>
                  <div className="lock-overlay">
                    <span className="lock-icon">🔒</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Leaderboard */}
        <div className="side-container leaderboard">
          <h2 className="container-title">LEADERBOARD</h2>
          {leaderboard.map((entry, index) => (
            <div key={index} className="leader-entry">
              {index + 1}. {entry.name} - {entry.score}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
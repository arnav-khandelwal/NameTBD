import React, { useState } from "react";
import "./landingPage.css";

export default function LandingPage({  onFreePlayStart }) {
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
    {/* Christmas Particle Background */}
<div className="snow-container">
  {[...Array(50)].map((_, i) => {
    // Every 5th particle is a candy cane, others are snowflakes
    const isCandyCane = i % 5 === 0;
    return (
      <div 
        key={i} 
        className={`particle ${isCandyCane ? 'candy-cane-particle' : 'snowflake'}`}
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${10 + Math.random() * 10}s`,
          fontSize: isCandyCane ? `${1 + Math.random() * 1}rem` : `${0.5 + Math.random() * 1}rem`
        }}
      >
        {isCandyCane ? '🎁' : '❄'}
      </div>
    );
  })}
</div>

      {/* Top Header Tags */}
      <div className="header-tags">
        <div className="tag-box candy-cane-border">v0.0.0</div>
        <div className="tag-box gold-text candy-cane-border">CHRISTMAS SPECIAL</div>
      </div>

      <div className="main-layout">
        {/* Left: Controls */}
        <div className="side-container controls candy-cane-border">
          <h2 className="container-title">CONTROLS</h2>
          <div className="control-group">
            <span className="control-label">CAMERA</span>
            <div className="control-desc"><p>🠔🖐️🠖</p>Open Hand (Left)</div>
          </div>
          <div className="control-group">
            <span className="control-label">SHOOT</span>
            <div className="control-desc"> <p> ✋🠖 🤏</p>Pinch Gesture</div>
          </div>
        </div>

        {/* Center: Main Game UI */}
        <div className="center-box candy-cane-border">
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
        <div className="side-container leaderboard candy-cane-border">
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
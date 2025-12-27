import React from "react";
import "./landingPage.css";

export default function landingPage({ onStart, handActive }) {
  // Mock leaderboard data based on the image
  const leaderboard = [
    { name: "SANTA_SLAYER", score: 2500 },
    { name: "ELF_HUNTER", score: 1800 },
  ];

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
          <h1 className="game-logo">BEATFALL</h1>
          
          <div className="button-wrapper">
            <button 
              className={`start-button ${!handActive ? 'loading' : ''}`}
              onClick={handActive ? onStart : null}
            >
              {handActive ? "CLICK TO START" : "INITIALIZING..."}
            </button>
            <div className="button-shadow"></div>
          </div>

          <div className="hand-status">
            <span className={`status-dot ${handActive ? 'online' : 'offline'}`}></span>
            {handActive ? "HAND DETECTED" : "SEARCHING FOR HAND..."}
          </div>
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
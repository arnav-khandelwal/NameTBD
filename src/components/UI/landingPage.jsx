import React, { useState, useRef } from "react";
import "./landingPage.css";

export default function LandingPage({  onFreePlayStart }) {
  const [showCampaign, setShowCampaign] = useState(false);
  const audioContextRef = useRef(null);

  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  };

  const playHoverBell = async () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  };

  const playClickThump = async () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  };

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
  {[...Array(60)].map((_, i) => {
    const isCandyCane = i % 5 === 0;
    const layerClass =
      i % 3 === 0
        ? "snow-layer-back"
        : i % 3 === 1
        ? "snow-layer-mid"
        : "snow-layer-front";

    const baseDuration =
      layerClass === "snow-layer-back"
        ? 24
        : layerClass === "snow-layer-mid"
        ? 17
        : 11;

    const sizeBase =
      layerClass === "snow-layer-back"
        ? 0.6
        : layerClass === "snow-layer-mid"
        ? 0.9
        : 1.1;

    const isRotatingFlake = !isCandyCane && i % 4 === 0;

    return (
      <div
        key={i}
        className={`particle ${
          isCandyCane ? "candy-cane-particle" : "snowflake"
        } ${layerClass} ${isRotatingFlake ? "flake-rotating" : ""}`}
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${baseDuration + Math.random() * 4}s`,
          fontSize: isCandyCane
            ? `${sizeBase + Math.random() * 0.6}rem`
            : `${sizeBase - 0.2 + Math.random() * 0.8}rem`,
        }}
      >
        {isCandyCane ? "🎁" : "❄"}
      </div>
    );
  })}
  <div className="center-drifter">❄</div>
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
                onMouseEnter={playHoverBell}
                onClick={() => {
                  setShowCampaign(true);
                  playClickThump();
                }}
              >
                CAMPAIGN
              </button>
              <button 
                className="mode-button freeplay-btn"
                onMouseEnter={playHoverBell}
                onClick={() => {
                  playClickThump();
                  onFreePlayStart && onFreePlayStart();
                }}
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
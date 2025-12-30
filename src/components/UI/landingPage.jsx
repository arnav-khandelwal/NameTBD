import React, { useState, useRef, useEffect } from "react";
import "./landingPage.css";
import { FaGamepad, FaBell, FaTrophy, FaStar, FaTree, FaSnowflake, FaVolumeUp, FaVolumeMute, FaHandPaper, FaHandRock } from "react-icons/fa";
import { GiPineTree, GiSparkles, GiHandOk } from "react-icons/gi";
import { IoSnowSharp, IoSettings, IoHelpCircle } from "react-icons/io5";
import { HiArrowSmLeft, HiArrowSmRight } from "react-icons/hi";
import { MdPanTool } from "react-icons/md";
import Settings from "./Settings";
import GameHelpModal from "./GameHelpModal";
import { getUserData } from "../../firebase/customAuth";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import cornerWreath from "../../assets/backgrounds/cornerWreath.png";
import landingPageSong from "../../assets/audio/landingpagesong.mp3";
import blackoutAudio from "../../assets/audio/blackout.mp3";
import relaxAudio from "../../assets/audio/Relax.mp3";
// Level to song mapping
const LEVEL_SONGS = {
  1: {
    id: "Black Out Days",
    title: "Black Out Days",
    artist: "Phantogram",
    audioUrl: blackoutAudio,
    duration: "3:45",
    color: "#c41e3a",
  },
  2: {
    id: "Relax",
    title: "Relax",
    artist: "Tower B. x L.E.M.",
    audioUrl: relaxAudio,
    duration: "3:30",
    color: "#81f93cff",
  },
  // Add more level-song mappings here
};

export default function LandingPage({  onFreePlayStart, onCampaignStart, onMusicControlReady }) {
  const [showCampaign, setShowCampaign] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [userLevel, setUserLevel] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('beatfall_settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      mainMenuVolume: 0.1,
      hapticsVolume: 0.8,
      gameVolume: 0.5,
      mainMenuMuted: false,
      hapticsMuted: false
    };
  });
  
  const audioContextRef = useRef(null);
  const bgMusicRef = useRef(null);
  const [isTemporarilyMuted, setIsTemporarilyMuted] = useState(false);

  // Load user data from localStorage and fetch if needed
  useEffect(() => {
    const loadUserData = async () => {
      // Try localStorage first
      const storedUserData = localStorage.getItem('beatfall_user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        setUserLevel(userData.level || 0);
        setIsLoggedIn(true);
      } else {
        // Fallback: check for username and fetch from Firebase
        const username = localStorage.getItem('beatfall_username');
        if (username) {
          const result = await getUserData(username);
          if (result.success) {
            const userData = {
              username: result.user.username,
              level: result.user.level || 0,
              bestScore: result.user.bestScore || 0
            };
            localStorage.setItem('beatfall_user_data', JSON.stringify(userData));
            setUserLevel(userData.level);
            setIsLoggedIn(true);
          }
        } else {
          setIsLoggedIn(false);
          setUserLevel(0);
        }
      }
    };
    loadUserData();
  }, []);

  // Fetch leaderboard from Firebase
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('bestScore', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        const leaderboardData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          leaderboardData.push({
            name: data.username,
            score: data.bestScore || 0
          });
        });
        
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Set empty leaderboard on error
        setLeaderboard([]);
      }
    };
    
    fetchLeaderboard();
  }, []);

  // Function to refresh user data after login/logout
  const refreshUserData = () => {
    const storedUserData = localStorage.getItem('beatfall_user_data');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUserLevel(userData.level || 0);
      setIsLoggedIn(true);
    } else {
      setUserLevel(0);
      setIsLoggedIn(false);
    }
  };

  // Expose music control to parent
  React.useEffect(() => {
    if (onMusicControlReady) {
      onMusicControlReady({
        muteForPreview: () => setIsTemporarilyMuted(true),
        unmuteFromPreview: () => setIsTemporarilyMuted(false),
      });
    }
  }, [onMusicControlReady]);

  // Start background music on mount or user interaction
  React.useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = settings.mainMenuVolume;
      // Try to play immediately
      const playPromise = bgMusicRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If autoplay is blocked, play on first user interaction
          const playOnInteraction = () => {
            bgMusicRef.current?.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('keydown', playOnInteraction, { once: true });
        });
      }
    }
  }, [settings.mainMenuVolume]);

  // Update volume when state changes
  React.useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = (settings.mainMenuMuted || isTemporarilyMuted) ? 0 : settings.mainMenuVolume;
    }
  }, [settings.mainMenuVolume, settings.mainMenuMuted, isTemporarilyMuted]);

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

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
    if (settings.hapticsMuted) return;
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

    const volume = settings.hapticsVolume * 0.06;
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  };

  const playClickThump = async () => {
    if (settings.hapticsMuted) return;
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

    const volume = settings.hapticsVolume * 0.08;
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  };

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
        {isCandyCane ? "🎁" : (
          i % 7 === 0 ? <GiSparkles /> : 
          i % 11 === 0 ? <FaStar /> : 
          <FaSnowflake />
        )}
      </div>
    );
  })}
  <div className="center-drifter"><IoSnowSharp /></div>
</div>

      {/* Top Header Tags */}
      <div className="header-tags">
        <div className="tag-box">v0.0.0</div>
        <div className="tag-box gold-text">CHRISTMAS SPECIAL</div>
        <button 
          className="settings-button"
          onClick={() => {
            setShowSettings(true);
            playClickThump();
          }}
          onMouseEnter={playHoverBell}
        >
          <IoSettings />
        </button>
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          initialSettings={settings}
          onSettingsChange={handleSettingsChange}          onUserDataChange={refreshUserData}        />
      )}

      <div className="main-layout">
        {/* Left: Controls */}
        <div className="side-container controls">
        <img src={cornerWreath} alt="" className="top-right-wreath"/>
        <img src={cornerWreath} alt="" className="top-left-wreath"/>
        <img src={cornerWreath} alt="" className="bot-left-wreath"/>
        <img src={cornerWreath} alt="" className="bot-right-wreath"/>
          <h2 className="container-title">
            <FaGamepad className="title-icon" />
            CONTROLS
            <button 
              className="controls-help-btn"
              onClick={() => {
                setShowHelpModal(true);
                playClickThump();
              }}
              onMouseEnter={playHoverBell}
            >
              <IoHelpCircle />
            </button>
          </h2>
          
          {/* CAMERA Sub-card */}
          <div className="control-subcard">
            <div className="control-label">MOVE</div>
            <div className="gesture-container">
              <div className="gesture-capsule">
                <HiArrowSmLeft className="gesture-arrow" />
              </div>
              <div className="gesture-capsule main-gesture">
                <MdPanTool className="gesture-icon hand-move" />
              </div>
              <div className="gesture-capsule">
                <HiArrowSmRight className="gesture-arrow" />
              </div>
            </div>
            <div className="control-desc">Move open left hand left/right</div>
          </div>
          
          {/* SHOOT Sub-card */}
          <div className="control-subcard">
            <div className="control-label">SHOOT</div>
            <div className="gesture-container">
              <div className="gesture-capsule pinch-gesture">
                <FaHandPaper className="gesture-icon hand-pinch-1" />
              </div>
              <div className="gesture-capsule">
                <HiArrowSmRight className="gesture-arrow" />
              </div>
              <div className="gesture-capsule pinch-gesture">
                <GiHandOk className="gesture-icon hand-pinch-2" />
              </div>
            </div>
            <div className="control-desc">Pinch fingers together</div>
          </div>
        </div>

        {/* Center: Main Game UI */}
        <div className="center-box">
           <img src={cornerWreath} alt="" className="top-right-wreath"/>
        <img src={cornerWreath} alt="" className="top-left-wreath"/>
        <img src={cornerWreath} alt="" className="bot-left-wreath"/>
        <img src={cornerWreath} alt="" className="bot-right-wreath"/>
          
          {showCampaign && (
            <button 
              className="go-back-btn" 
              onClick={() => {
                playClickThump();
                handleGoBack();
              }}
              onMouseEnter={playHoverBell}
            >
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
            <div className="campaign-levels-container">
              <div className="level-grid">
                {levels.map((level) => {
                  const isUnlocked = isLoggedIn && level <= userLevel + 1;
                  return (
                    <div 
                      key={level} 
                      className={`level-box ${isUnlocked ? 'unlocked' : 'locked'}`}
                      onMouseEnter={() => {
                        if (isUnlocked && !settings.hapticsMuted) {
                          playHoverBell();
                        }
                      }}
                      onClick={() => {
                        if (isUnlocked) {
                          playClickThump();
                          // Start campaign with level-specific song
                          const levelSong = LEVEL_SONGS[level];
                          if (levelSong && onCampaignStart) {
                            onCampaignStart(level, levelSong);
                          }
                        }
                      }}
                    >
                      <div className="level-number">{level}</div>
                      {!isUnlocked && (
                        <div className="lock-overlay">
                          <span className="lock-icon">🔒</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!isLoggedIn && (
                <div className="login-required-overlay">
                  <div className="login-required-card">
                    <span className="login-required-icon">🔒</span>
                    <h3 className="login-required-title">Login Required</h3>
                    <p className="login-required-text">Sign in to unlock and play campaign levels</p>
                    <button 
                      className="login-required-button"
                      onClick={() => {
                        playClickThump();
                        setShowSettings(true);
                      }}
                      onMouseEnter={playHoverBell}
                    >
                      Login to Play Levels
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Leaderboard */}
        <div className="side-container leaderboard">
          <img src={cornerWreath} alt="" className="top-right-wreath"/>
        <img src={cornerWreath} alt="" className="top-left-wreath"/>
        <img src={cornerWreath} alt="" className="bot-left-wreath"/>
        <img src={cornerWreath} alt="" className="bot-right-wreath"/>
          <h2 className="container-title">
            <FaTrophy className="title-icon" />
            <FaStar className="title-icon-accent" />
            LEADERBOARD
          </h2>
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <div key={index} className="leader-entry">
                {index + 1}. {entry.name} - {entry.score}
              </div>
            ))
          ) : (
            <div className="leader-entry empty">
              No scores yet!
            </div>
          )}
        </div>
      </div>
      
      {/* Background Music */}
      <audio 
        ref={bgMusicRef}
        src={landingPageSong}
        loop
        preload="auto"
        autoPlay
        playsInline
      />

      {/* Help Modal */}
      {showHelpModal && (
        <GameHelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
}
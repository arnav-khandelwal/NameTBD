import { useState, useRef, useCallback, useEffect } from "react";
import { IoMusicalNotes, IoHome, IoHelpCircle } from "react-icons/io5";
import { useHandInput } from "./hooks/useHandInput";
import { useAudioAnalyzer } from "./hooks/useAudioAnalyzer";
import { useEnemies } from "./hooks/useEnemies";
import HandCanvas from "./components/HandCanvas";
import WaveCanvas from "./components/WaveCanvas";
import SongSelector from "./components/UI/SongSelector";
import World from "./world/World";
import ScopeOverlay from "./components/UI/ScopeOverlay";
import Minimap from "./components/UI/Minimap";
import "./components/UI/ScopeOverlay.css";
import HealthBar from "./world/UserHealthBar";
import { FaSnowflake } from "react-icons/fa";
import { updateUserProgress } from "./firebase/customAuth";
import "./components/UI/landingPage.css"
import GameHelpModal from "./components/UI/GameHelpModal";
export default function App({ showSongSelector: externalShowSongSelector, setShowSongSelector: externalSetShowSongSelector, onSongSelected, onMainMenu, isGameActive, landingPageMusicControl, initialSong }) {
  const MAX_PLAYER_HEALTH = 500
  const [playerHp, setPlayerHp] = useState(MAX_PLAYER_HEALTH); /*user's health */
  const [gameOver, setGameOver] = useState(false);
  const [hand, setHand] = useState({ active: false });
  const [internalShowSongSelector, setInternalShowSongSelector] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [score, setScore] = useState(0);
  const [userBestScore, setUserBestScore] = useState(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Use external control if provided, otherwise use internal state
  const showSongSelector = externalShowSongSelector !== undefined ? externalShowSongSelector : internalShowSongSelector;
  const setShowSongSelector = externalSetShowSongSelector || setInternalShowSongSelector;

  const pulsesRef = useRef([]);
  const audioContextRef = useRef(null);

  // Load user's best score from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('beatfall_user_data');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUserBestScore(userData.bestScore || 0);
    } else {
      setUserBestScore(null);
    }
  }, []);

  // Handle initial song selection for campaign mode
  useEffect(() => {
    if (initialSong && !selectedSong) {
      setSelectedSong(initialSong);
      // Auto-play the selected song
      setTimeout(() => {
        audio.play();
      }, 100);
    }
  }, [initialSong]);

  // Check and update high score when game ends
  useEffect(() => {
    if (gameOver && userBestScore !== null && score > userBestScore) {
      setIsNewHighScore(true);
      
      // Update in Firebase
      const storedUserData = localStorage.getItem('beatfall_user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        const username = userData.username;
        
        updateUserProgress(username, undefined, score).then((result) => {
          if (result.success) {
            // Update localStorage
            userData.bestScore = score;
            localStorage.setItem('beatfall_user_data', JSON.stringify(userData));
            setUserBestScore(score);
          }
        });
      }
    } else if (gameOver) {
      setIsNewHighScore(false);
    }
  }, [gameOver, score, userBestScore]);

  useHandInput(setHand, isGameActive);

  // Disable aim and fire when on landing page
  const activeHand = isGameActive ? hand : { ...hand, aim: false, fire: false };

  // Audio system - only initialize when song is selected
  const audio = useAudioAnalyzer(selectedSong?.audioUrl || null);

  // Callback to trigger strong pulse on enemy spawn
  const handleEnemySpawn = useCallback((spawnY) => {
    const NEON_COLORS = [
      350, // deep christmas red
      5,   // warm red
      38,  // soft gold
      48,  // champagne gold
      100, // muted pine green (NOT pure green)
      165  // teal-green (aurora vibe)
    ];

    pulsesRef.current.push({
      x: 0,
      radius: 0,
      strength: 2, // Strong pulse
      color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      opacity: 1,
      amplitude: 80 + Math.random() * 40,
      rippleCount: 3, // More ripples for strong pulse
      spawnY: spawnY, // Store spawn Y position for glow effect
    });
  }, []);

  const handlePlayerDamage = useCallback((enemy) => {
    const DAMAGE_MAP = {
      krampus: 20,
      gremlin: 10,
      ghostImg: 5,
      BOSS: 50
    };

    const DAMAGE = DAMAGE_MAP[enemy.type] ?? 10;

    setPlayerHp(prev => {
      const nextHp = Math.max(0, prev - DAMAGE);
      if (nextHp === 0) setGameOver(true);
      return nextHp;
    });
  }, []);

  // Haptics functions
  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  };

  const playClickSound = async () => {
    // Get settings from localStorage
    const storedSettings = localStorage.getItem('beatfall_settings');
    let settings = { hapticsMuted: false, hapticsVolume: 0.5 };
    if (storedSettings) {
      settings = JSON.parse(storedSettings);
    }
    
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


  // Enemy spawning system with strong pulse callback
  const { enemies, damageEnemy } = useEnemies(audio.beatDetected, audio.isPlaying && !gameOver, handleEnemySpawn, handlePlayerDamage);

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    setShowSongSelector(false);
    // Notify parent that song was selected (hide landing page)
    if (onSongSelected) {
      onSongSelected();
    }

    // Auto-play the selected song
    setTimeout(() => {
      audio.play();
    }, 100);
  };

  const handleStop = () => {
    audio.pause();
    setSelectedSong(null);
  };

  const handleMainMenuClick = () => {
    // Pause audio if playing
    if (audio.isPlaying) {
      audio.pause();
    }
    // Clear selected song
    setSelectedSong(null);
    // Reset game over state
    setGameOver(false);
    setPlayerHp(MAX_PLAYER_HEALTH);
    setScore(0);
    setIsNewHighScore(false);
    // Navigate to main menu
    if (onMainMenu) {
      onMainMenu();
    }
  };

  useEffect(() => {
    if (gameOver && audio?.isPlaying) {
      audio.pause();
    }
  }, [gameOver, audio]);

  const handleRestartGame = () => {
    setGameOver(false);
    setPlayerHp(MAX_PLAYER_HEALTH);
    setScore(0);
    setIsNewHighScore(false);
    // Restart audio
    if (audio && selectedSong) {
      audio.restart?.();
    }
  };

  return (
    <>
      {/* Song Selection Modal */}
      {showSongSelector && (
        <SongSelector
          onSongSelect={handleSongSelect}
          onClose={() => setShowSongSelector(false)}
          landingPageMusicControl={landingPageMusicControl}
        />
      )}

      {/* Wave visualization (behind everything) */}
      <WaveCanvas
        currentAmplitude={audio.currentAmplitude}
        beatDetected={audio.beatDetected}
        isPlaying={audio.isPlaying}
        pulsesRef={pulsesRef}
      />

      <World hand={hand} enemies={enemies} setScore={setScore} damageEnemy={damageEnemy} />

      <HandCanvas isGameActive={isGameActive}
        landmarks={activeHand.landmarks}
        aim={activeHand.aim}
        fire={activeHand.fire}
      />
      {/*UserHealthBar*/}
      <HealthBar hp={playerHp} maxHp={MAX_PLAYER_HEALTH} />
      <ScopeOverlay visible={activeHand.aim} fire={hand.fire} />
      {/* Top-right Controls */}
      <div style={{
        position: "fixed",
        top: 10,
        right: 10,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        {/* Main Menu Button */}
        <button
          onClick={handleMainMenuClick}
          style={{
            padding: "12px 18px",
            fontSize: "24px",
            background: "rgba(138, 43, 226, 0.12)",
            color: "#8a2be2",
            border: "2px solid #8a2be2",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(138, 43, 226, 0.15)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#8a2be2";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(138, 43, 226, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(138, 43, 226, 0.12)";
            e.currentTarget.style.color = "#8a2be2";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(138, 43, 226, 0.15)";
          }}
        >
          <IoHome />
        </button>

        <button
          onClick={() => setShowSongSelector(true)}
          style={{
            padding: "12px 18px",
            fontSize: "24px",
            background: "rgba(196, 30, 58, 0.12)",
            color: "#c41e3a",
            border: "2px solid #c41e3a",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(196, 30, 58, 0.15)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#c41e3a";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(196, 30, 58, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(196, 30, 58, 0.12)";
            e.currentTarget.style.color = "#c41e3a";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(196, 30, 58, 0.15)";
          }}
        >
          <IoMusicalNotes />
        </button>

        {/* Help Button */}
        <button
          onClick={() => {
            setShowHelpModal(true);
            // Pause audio if playing
            if (audio?.isPlaying) {
              audio.pause();
            }
          }}
          style={{
            padding: "12px 18px",
            fontSize: "24px",
            background: "rgba(30, 144, 255, 0.12)",
            color: "#1e90ff",
            border: "2px solid #1e90ff",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(30, 144, 255, 0.15)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1e90ff";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(30, 144, 255, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(30, 144, 255, 0.12)";
            e.currentTarget.style.color = "#1e90ff";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(30, 144, 255, 0.15)";
          }}
        >
          <IoHelpCircle />
        </button>
      </div>

      {/* Audio debug info */}
      {selectedSong && (
        <div style={{
          position: "fixed",
          top: 200,
          right: 10,
          color: "#1a1a1a",
          fontSize: "12px",
          background: "rgba(255, 255, 255, 0.92)",
          padding: "12px 14px",
          borderRadius: "10px",
          border: "2px solid #c41e3a",
          zIndex: 100,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "5px", color: "#c41e3a" }}>
            {selectedSong.title}
          </div>
          {!audio.isCalibrated && audio.isPlaying && (
            <div>Calibrating... {Math.floor(audio.calibrationProgress * 100)}%</div>
          )}
          {audio.isCalibrated && (
            <>
              <div>Amplitude: {audio.currentAmplitude.toFixed(1)}</div>
              <div>Baseline: {audio.averageAmplitude.toFixed(1)}</div>
              <div>Enemies: {enemies.length}</div>
              <div>Beat: {audio.beatDetected ? "💥" : "—"}</div>
            </>
          )}
        </div>
      )}
      {isGameActive && <div
        style={{
          position: "fixed",
          top: 10,
          right: 90,
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
          zIndex: 9999,
          background: "rgba(0,0,0,0.6)",
          padding: "10px 16px",
          borderRadius: "8px",
        }}
      >
        Score: {score}
      </div>
      }
      {/* Minimap and High Score */}
      <div style={{
        position: "fixed",
        top: 10,
        left: 220,
        display: "flex",
        alignItems: "center",
        gap: "15px",
        zIndex: 100
      }}>
        <Minimap enemies={enemies} hand={activeHand} />
        {userBestScore !== null && (
          <div style={{
            padding: "8px 16px",
            background: "rgba(138, 43, 226, 0.12)",
            color: "#8a2be2",
            border: "2px solid rgba(138, 43, 226, 0.4)",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "14px",
            textShadow: "0 0 8px rgba(138, 43, 226, 0.8)",
            whiteSpace: "nowrap"
          }}>
            High Score: {userBestScore}
          </div>
        )}
      </div>

      {gameOver && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "monospace"
        }}>
          <h1 className="game-logo"
            style={{
              fontSize: "64px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              letterSpacing: "4px",
            }}
          >
            <span>GAME</span>

            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FaSnowflake
                size={54}
                className="decoration-berry glow-snowflake"
                style={{ transform: "translateY(-4px) translateX(6px)" }}
              />
              <span>VER</span>
            </span>
          </h1>

          <p className="game-logo" style={{ fontSize: "24px", marginBottom: "30px" }}>
            Final Score: {score}
          </p>

             {userBestScore !== null && (
              <p className="game-logo" style={{ fontSize: "24px", marginBottom: "30px" }}>
                Your High Score: {isNewHighScore ? score : userBestScore}
              </p>
            )}


          
          <button className="mode-button"
            onClick={() => {
              playClickSound();
              handleRestartGame();
            }}
            style={{
              padding: "12px 20px",
              fontSize: "18px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "none",
              background: "rgba(234, 20, 20, 0.6)",
              color: "white",
              marginBottom: "15px",
            }}
          >
            Restart
          </button>

          <button className="mode-button"
            onClick={() => {
              playClickSound();
              handleMainMenuClick();
            }}
            style={{
              padding: "12px 20px",
              fontSize: "18px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "none",
              background: "rgba(138, 43, 226, 0.6)",
              color: "white",
            }}
          >
            <IoHome style={{ marginRight: "8px", verticalAlign: "middle" }} />
            Main Menu
          </button>
        </div>
      )}

      {/* Game Help Modal */}
      {showHelpModal && (
        <GameHelpModal onClose={() => {
          setShowHelpModal(false);
          // Resume audio if there was a selected song and game is active
          if (selectedSong && isGameActive && !gameOver) {
            audio.play();
          }
        }} />
      )}
    </>
  );
}
import { useState, useRef, useCallback } from "react";
import { IoMusicalNotes, IoStop, IoHome } from "react-icons/io5";
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

export default function App({ showSongSelector: externalShowSongSelector, setShowSongSelector: externalSetShowSongSelector, onSongSelected, onMainMenu, isGameActive }) {
  const [hand, setHand] = useState({ active: false });
  const [internalShowSongSelector, setInternalShowSongSelector] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  // Use external control if provided, otherwise use internal state
  const showSongSelector = externalShowSongSelector !== undefined ? externalShowSongSelector : internalShowSongSelector;
  const setShowSongSelector = externalSetShowSongSelector || setInternalShowSongSelector;

  const pulsesRef = useRef([]);

  useHandInput(setHand);

  // Disable aim and fire when on landing page
  const activeHand = isGameActive ? hand : { ...hand, aim: false, fire: false };

  // Audio system - only initialize when song is selected
  const audio = useAudioAnalyzer(selectedSong?.audioUrl || null);

  // Callback to trigger strong pulse on enemy spawn
  const handleEnemySpawn = useCallback((spawnY) => {
    const NEON_COLORS = [0, 120, 180, 240, 300, 45];

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

  // Enemy spawning system with strong pulse callback
  const { enemies } = useEnemies(audio.beatDetected, audio.isPlaying, handleEnemySpawn);

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
    // Navigate to main menu
    if (onMainMenu) {
      onMainMenu();
    }
  };

  return (
    <>
      {/* Song Selection Modal */}
      {showSongSelector && (
        <SongSelector
          onSongSelect={handleSongSelect}
          onClose={() => setShowSongSelector(false)}
        />
      )}

      {/* Wave visualization (behind everything) */}
      <WaveCanvas
        currentAmplitude={audio.currentAmplitude}
        beatDetected={audio.beatDetected}
        isPlaying={audio.isPlaying}
        pulsesRef={pulsesRef}
      />

      {/* 3D World with enemies and hand tracking */}
      <World hand={hand} enemies={enemies} />

      <HandCanvas
        landmarks={hand.landmarks}
        aim={activeHand.aim}
        fire={activeHand.fire}
      />

      <ScopeOverlay visible={activeHand.aim} />
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

        {/* Stop button - only show when song is selected */}
        {selectedSong && (
          <button
            onClick={handleStop}
            style={{
              padding: "10px 16px",
              fontSize: "20px",
              background: "rgba(22, 91, 51, 0.12)",
              color: "#165b33",
              border: "2px solid #165b33",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(22, 91, 51, 0.15)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#165b33";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(22, 91, 51, 0.25)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(22, 91, 51, 0.12)";
              e.currentTarget.style.color = "#165b33";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(22, 91, 51, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <IoStop />
          </button>
        )}
      </div>

      {/* Audio debug info */}
      {selectedSong && (
        <div style={{
          position: "fixed",
          top: 130,
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

      {/* Minimap */}
      <Minimap enemies={enemies} hand={activeHand} />
    </>
  );
}
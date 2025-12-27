import { useState, useRef, useCallback } from "react";
import { useHandInput } from "./hooks/useHandInput";
import { useAudioAnalyzer } from "./hooks/useAudioAnalyzer";
import { useEnemies } from "./hooks/useEnemies";
import HandCanvas from "./components/HandCanvas";
import WaveCanvas from "./components/WaveCanvas";
import EnemyRenderer from "./components/EnemyRenderer";
import blackoutAudio from "./assets/audio/blackout.mp3";

export default function App() {
  const [hand, setHand] = useState({ active: false });
  const pulsesRef = useRef([]);

  useHandInput(setHand);

  // Audio system using local blackout.mp3 file
  const audio = useAudioAnalyzer(blackoutAudio);
  
  // Callback to trigger strong pulse on enemy spawn
  const handleEnemySpawn = useCallback(() => {
    const NEON_COLORS = [0, 120, 180, 240, 300, 45];
    
    pulsesRef.current.push({
      x: 0,
      radius: 0,
      strength: 2, // Strong pulse
      color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      opacity: 1,
      amplitude: 80 + Math.random() * 40,
      rippleCount: 3, // More ripples for strong pulse
    });
  }, []);
  
  // Enemy spawning system with strong pulse callback
  const { enemies } = useEnemies(audio.beatDetected, audio.isPlaying, handleEnemySpawn);

  return (
    <>
      {/* Wave visualization (behind everything) */}
      <WaveCanvas
        currentAmplitude={audio.currentAmplitude}
        beatDetected={audio.beatDetected}
        isPlaying={audio.isPlaying}
        pulsesRef={pulsesRef}
      />

      {/* Enemies */}
      <EnemyRenderer enemies={enemies} />

      {/* Hand tracking overlay */}
      <HandCanvas
        landmarks={hand.landmarks}
        aim={hand.aim}
        fire={hand.fire}
      />

      {/* Audio controls */}
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 100 }}>
        <button
          onClick={audio.isPlaying ? audio.pause : audio.play}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: audio.isPlaying ? "#f00" : "#0f0",
            color: "#000",
            border: "2px solid #fff",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)",
          }}
        >
          {audio.isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>

      {/* Audio debug info */}
      <div style={{ 
        position: "fixed", 
        top: 60, 
        right: 10, 
        color: "#0af",
        fontSize: "12px",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 100,
      }}>
        {!audio.isCalibrated && audio.isPlaying && (
          <div>🎵 Calibrating... {Math.floor(audio.calibrationProgress * 100)}%</div>
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

      {/* Hand tracking debug */}
      <div style={{ position: "fixed", top: 10, left: 10, color: "#0af", zIndex: 100 }}>
        {!hand.active && <div>Hand not detected</div>}
        {hand.active && (
          <>
            <div>Aim: {hand.aim ? "YES" : "NO"}</div>
            <div>Fire: {hand.fire ? "YES" : "NO"}</div>
          </>
        )}
      </div>

      {/* DEPTH WARNINGS */}
      {hand.depthError === "TOO_CLOSE" && (
        <div style={{ 
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "red",
          fontSize: "32px",
          fontWeight: "bold",
          textShadow: "0 0 20px rgba(255, 0, 0, 0.8)",
          zIndex: 100,
        }}>
          ✋ Move hand away
        </div>
      )}
      {hand.depthError === "TOO_FAR" && (
        <div style={{ 
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "orange",
          fontSize: "32px",
          fontWeight: "bold",
          textShadow: "0 0 20px rgba(255, 165, 0, 0.8)",
          zIndex: 100,
        }}>
          ✋ Move hand closer
        </div>
      )}
    </>
  );
}

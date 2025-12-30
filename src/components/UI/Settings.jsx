import { useState, useEffect, useRef } from "react";
import { IoClose, IoVolumeHigh, IoVolumeMute, IoGameController, IoMusicalNotes, IoLogOut } from "react-icons/io5";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { GiSoundWaves } from "react-icons/gi";
import LoginModal from "./LoginModal";
import LogoutModal from "./LogoutModal";
import "./Settings.css";

export default function Settings({ onClose, initialSettings, onSettingsChange, onUserDataChange }) {
  const [mainMenuVolume, setMainMenuVolume] = useState(initialSettings.mainMenuVolume);
  const [hapticsVolume, setHapticsVolume] = useState(initialSettings.hapticsVolume);
  const [gameVolume, setGameVolume] = useState(initialSettings.gameVolume);
  const [mainMenuMuted, setMainMenuMuted] = useState(initialSettings.mainMenuMuted);
  const [hapticsMuted, setHapticsMuted] = useState(initialSettings.hapticsMuted || false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const previousMainMenuVolumeRef = useRef(initialSettings.mainMenuVolume || 0.1);
  const previousHapticsVolumeRef = useRef(initialSettings.hapticsVolume || 0.5);
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const savedUsername = localStorage.getItem('beatfall_username');
    if (savedUsername) {
      setCurrentUser({ username: savedUsername });
    }
  }, []);

  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  };

  const playHoverSound = async () => {
    if (hapticsMuted || hapticsVolume === 0) return;
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

    const volume = hapticsVolume * 0.06;
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  };

  const playClickSound = async () => {
    if (hapticsMuted || hapticsVolume === 0) return;
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

    const volume = hapticsVolume * 0.08;
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  };

  useEffect(() => {
    // Save settings to localStorage whenever they change
    const settings = {
      mainMenuVolume,
      hapticsVolume,
      gameVolume,
      mainMenuMuted,
      hapticsMuted
    };
    localStorage.setItem('beatfall_settings', JSON.stringify(settings));
    
    // Notify parent component of changes
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [mainMenuVolume, hapticsVolume, gameVolume, mainMenuMuted, hapticsMuted, onSettingsChange]);

  const handleMainMenuVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setMainMenuVolume(newVolume);
    if (newVolume === 0) {
      setMainMenuMuted(true);
    } else {
      setMainMenuMuted(false);
    }
  };

  const toggleMainMenuMute = () => {
    playClickSound();
    if (!mainMenuMuted) {
      previousMainMenuVolumeRef.current = mainMenuVolume > 0 ? mainMenuVolume : 0.1;
      setMainMenuVolume(0);
      setMainMenuMuted(true);
    } else {
      const restoreVolume = previousMainMenuVolumeRef.current;
      setMainMenuVolume(restoreVolume);
      setMainMenuMuted(false);
    }
  };

  const handleHapticsVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setHapticsVolume(newVolume);
    if (newVolume === 0) {
      setHapticsMuted(true);
    } else {
      previousHapticsVolumeRef.current = newVolume;
      setHapticsMuted(false);
    }
  };

  const toggleHapticsMute = () => {
    // Use the current volume before toggling
    const currentHapticsVolume = hapticsVolume;
    const currentHapticsMuted = hapticsMuted;
    
    if (!currentHapticsMuted) {
      previousHapticsVolumeRef.current = currentHapticsVolume > 0 ? currentHapticsVolume : 0.5;
      setHapticsVolume(0);
      setHapticsMuted(true);
    } else {
      const restoreVolume = previousHapticsVolumeRef.current;
      setHapticsVolume(restoreVolume);
      setHapticsMuted(false);
      // Play sound with the restored volume
      setTimeout(() => playClickSound(), 10);
    }
  };

  const handleGameVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    // Ensure game volume is never below 0.1
    setGameVolume(Math.max(0.1, newVolume));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    playClickSound();
    onClose();
  };

  const handleLoginClick = () => {
    playClickSound();
    setShowLoginModal(true);
  };

  const handleLogoutClick = () => {
    playClickSound();
    setShowLogoutModal(true);
  };

  const handleLoginSuccess = (user) => {
    // Store user data in localStorage
    const userData = {
      username: user.username,
      level: user.level || 0,
      bestScore: user.bestScore || 0
    };
    localStorage.setItem('beatfall_user_data', JSON.stringify(userData));
    
    setCurrentUser(user);
    setShowLoginModal(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('beatfall-user-updated'));
    }
    
    // Notify parent to refresh user data
    if (onUserDataChange) {
      onUserDataChange();
    }
  };

  const handleLogoutConfirm = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem('beatfall_username');
    localStorage.removeItem('beatfall_user_data');
    
    setCurrentUser(null);
    setShowLogoutModal(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('beatfall-user-updated'));
    }
    
    // Notify parent to refresh user data
    if (onUserDataChange) {
      onUserDataChange();
    }
  };

  return (
    <>
      <div className="settings-backdrop" onClick={handleBackdropClick}>
        <div className="settings-modal">
          <div className="settings-header">
            <h2 className="settings-title">Settings</h2>
            <button 
              className="settings-close-button" 
              onClick={handleCloseClick}
              onMouseEnter={playHoverSound}
            >
              <IoClose />
            </button>
          </div>

          <div className="settings-content">
            {/* Main Menu Volume */}
            <div className="setting-group">
              <div className="setting-label">
                <IoMusicalNotes className="setting-icon" />
                <span>Main Menu Volume</span>
              </div>
              <div className="volume-control-group">
                <button 
                  className="volume-mute-btn" 
                  onClick={toggleMainMenuMute}
                  onMouseEnter={playHoverSound}
                >
                  {mainMenuMuted || mainMenuVolume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={mainMenuVolume}
                  onChange={handleMainMenuVolumeChange}
                  className="settings-slider"
                />
                <span className="volume-value">{Math.round(mainMenuVolume * 100)}%</span>
              </div>
            </div>

            {/* Haptics Volume */}
            <div className="setting-group">
              <div className="setting-label">
                <GiSoundWaves className="setting-icon" />
                <span>Haptics Volume</span>
              </div>
              <div className="volume-control-group">
                <button 
                  className="volume-mute-btn" 
                  onClick={toggleHapticsMute}
                  onMouseEnter={playHoverSound}
                >
                  {hapticsMuted || hapticsVolume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={hapticsVolume}
                  onChange={handleHapticsVolumeChange}
                  className="settings-slider"
                />
                <span className="volume-value">{Math.round(hapticsVolume * 100)}%</span>
              </div>
            </div>

            {/* Game Volume */}
            <div className="setting-group">
              <div className="setting-label">
                <IoGameController className="setting-icon" />
                <span>Game Volume</span>
              </div>
              <div className="volume-control-group">
                <button className="volume-mute-btn disabled">
                  <FaVolumeUp />
                </button>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={gameVolume}
                  onChange={handleGameVolumeChange}
                  className="settings-slider"
                />
                <span className="volume-value">{Math.round(gameVolume * 100)}%</span>
              </div>
              <p className="setting-note">Game volume cannot be muted below 10%</p>
            </div>
          </div>

          {/* Login/Logout Button */}
          <div className="settings-footer">
            {currentUser ? (
              <div className="logout-section">
                <button 
                  className="logout-button" 
                  onClick={handleLogoutClick}
                  onMouseEnter={playHoverSound}
                >
                  <IoLogOut />
                  Log Out
                </button>
                <span className="logged-in-text">Logged in as {currentUser.username}</span>
              </div>
            ) : (
              <button 
                className="login-button" 
                onClick={handleLoginClick}
                onMouseEnter={playHoverSound}
              >
                Log In to Save Progress
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal 
          username={currentUser?.username}
          onConfirm={handleLogoutConfirm}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}

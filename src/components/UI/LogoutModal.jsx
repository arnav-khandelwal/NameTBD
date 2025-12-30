import { useRef } from "react";
import { IoClose, IoLogOut } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import "./LogoutModal.css";

export default function LogoutModal({ username, onConfirm, onClose }) {
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

  const playClickSound = async () => {
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

  const handleConfirm = () => {
    playClickSound();
    onConfirm();
  };

  const handleCancel = () => {
    playClickSound();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="logout-modal-backdrop" onClick={handleBackdropClick}>
      <div className="logout-modal">
        <div className="logout-modal-header">
          <h2 className="logout-modal-title">Confirm Logout</h2>
          <button className="logout-close-button" onClick={handleCancel}>
            <IoClose />
          </button>
        </div>

        <div className="logout-modal-content">
          <div className="logout-user-info">
            <FaUser className="logout-user-icon" />
            <div className="logout-user-details">
              <span className="logout-username">{username}</span>
              <span className="logout-subtext">Currently logged in</span>
            </div>
          </div>

          <p className="logout-message">
            Are you sure you want to log out? Your progress will be saved.
          </p>

          <div className="logout-actions">
            <button className="logout-cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button className="logout-confirm-button" onClick={handleConfirm}>
              <IoLogOut />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

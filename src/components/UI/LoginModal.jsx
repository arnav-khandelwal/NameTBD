import { useState, useRef } from "react";
import { IoClose, IoEye, IoEyeOff } from "react-icons/io5";
import { FaUser, FaLock } from "react-icons/fa";
import { registerUser, loginUser } from "../../firebase/customAuth";
import "./LoginModal.css";

export default function LoginModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
    }

    try {
      let result;
      
      if (isLogin) {
        // Login
        result = await loginUser(username, password);
      } else {
        // Signup
        result = await registerUser(username, password);
      }

      if (result.success) {
        playClickSound();
        
        // Prepare user data
        const userData = {
          username: username,
          level: result.user?.level || 0,
          bestScore: result.user?.bestScore || 0
        };
        
        // Save to localStorage
        localStorage.setItem('beatfall_username', username);
        localStorage.setItem('beatfall_user_data', JSON.stringify(userData));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent('beatfall-user-updated'));
        }
        
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const switchMode = () => {
    playClickSound();
    setIsLogin(!isLogin);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="login-modal-backdrop" onClick={handleBackdropClick}>
      <div className="login-modal">
        <div className="login-modal-header">
          <h2 className="login-modal-title">{isLogin ? "Login" : "Sign Up"}</h2>
          <button className="login-close-button" onClick={handleCloseClick}>
            <IoClose />
          </button>
        </div>

        <form className="login-modal-content" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          {/* Username */}
          <div className="login-input-group">
            <div className="login-input-icon">
              <FaUser />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="login-input-group">
            <div className="login-input-icon">
              <FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              disabled={loading}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button
              type="button"
              className="login-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          {/* Confirm Password (Signup only) */}
          {!isLogin && (
            <div className="login-input-group">
              <div className="login-input-icon">
                <FaLock />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="login-input"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="login-toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>

          {/* Switch Mode */}
          <div className="login-switch-mode">
            <span>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              className="login-switch-button"
              onClick={switchMode}
              disabled={loading}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

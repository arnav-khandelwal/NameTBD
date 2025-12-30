import { useState, useRef, useEffect } from "react";
import { IoClose, IoHeadset, IoPlay, IoMusicalNotes, IoStop } from "react-icons/io5";
import "./SongSelector.css";
import blackoutAudio from "../../assets/audio/blackout.mp3";
import relaxAudio from "../../assets/audio/Relax.mp3";

// Song library - easily extensible for more songs
const SONGS = [
  {
    id: "Black Out Days",
    title: "Black Out Days",
    artist: "Phantogram",
    audioUrl: blackoutAudio,
    duration: "3:45",
    color: "#c41e3a", // Christmas red
  },
  {
    id: "Relax",
    title: "Relax",
    artist: "Tower B. x L.E.M.",
    audioUrl: relaxAudio,
    duration: "3:30",
    color: "#81f93cff", // Christmas green
  },
  // Add more songs here in the future
];

export default function SongSelector({ onSongSelect, onClose, landingPageMusicControl }) {
  const [hoveredSong, setHoveredSong] = useState(null);
  const [previewingSong, setPreviewingSong] = useState(null);
  const [previewProgress, setPreviewProgress] = useState(0);
  const previewAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const previewTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Cleanup preview audio on unmount and unmute landing page music
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Unmute landing page music when modal closes
      if (landingPageMusicControl) {
        landingPageMusicControl.unmuteFromPreview();
      }
    };
  }, [landingPageMusicControl]);

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

  const handlePreview = (song) => {
    playClickSound();
    // Stop any existing preview
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Mute landing page music
    if (landingPageMusicControl) {
      landingPageMusicControl.muteForPreview();
    }

    // Create new audio element
    const audio = new Audio(song.audioUrl);
    previewAudioRef.current = audio;

    // Start from a random position (avoid first and last 10 seconds)
    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration;
      const minStart = 10;
      const maxStart = Math.max(minStart, duration - 15);
      const randomStart = minStart + Math.random() * (maxStart - minStart);
      audio.currentTime = randomStart;
    });

    // Play for 10 seconds then stop
    audio.play();
    setPreviewingSong(song.id);
    setPreviewProgress(0);

    // Update progress every 100ms
    const startTime = Date.now();
    const previewDuration = 10000; // 10 seconds
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / previewDuration) * 100, 100);
      setPreviewProgress(progress);
    }, 100);

    previewTimeoutRef.current = setTimeout(() => {
      audio.pause();
      setPreviewingSong(null);
      setPreviewProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Unmute landing page music when preview ends
      if (landingPageMusicControl) {
        landingPageMusicControl.unmuteFromPreview();
      }
    }, previewDuration);

    audio.addEventListener("ended", () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setPreviewingSong(null);
      setPreviewProgress(0);
      // Unmute landing page music when preview ends
      if (landingPageMusicControl) {
        landingPageMusicControl.unmuteFromPreview();
      }
    });
  };
  const handleStopPreview = () => {
    playClickSound();
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setPreviewingSong(null);
    setPreviewProgress(0);
    // Unmute landing page music
    if (landingPageMusicControl) {
      landingPageMusicControl.unmuteFromPreview();
    }
  };
  const handlePlay = (song) => {
    playClickSound();
    // Stop preview if playing
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPreviewingSong(null);
    onSongSelect(song);
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

  return (
    <div className="song-selector-backdrop" onClick={handleBackdropClick}>
      <div className="song-selector-modal">
        <div className="modal-header">
          <h2 className="modal-title">Select Your Track</h2>
          <button className="close-button" onClick={handleCloseClick}>
            <IoClose />
          </button>
        </div>

        <div className="songs-list">
          {SONGS.map((song) => (
            <div
              key={song.id}
              className={`song-card ${hoveredSong === song.id ? "hovered" : ""}`}
              onMouseEnter={() => {
                setHoveredSong(song.id);
                playHoverSound();
              }}
              onMouseLeave={() => setHoveredSong(null)}
              style={{ "--song-color": song.color }}
            >
              <div className="song-info">
                <div className="song-icon">
                  <IoMusicalNotes />
                </div>
                <div className="song-details">
                  <h3 className="song-title">{song.title}</h3>
                  <p className="song-artist">{song.artist}</p>
                  <p className="song-duration">{song.duration}</p>
                </div>
              </div>

              <div className="song-actions">
                <button
                  className={`action-button preview-button ${
                    previewingSong === song.id ? "active" : ""
                  }`}
                  onClick={() => previewingSong === song.id ? handleStopPreview() : handlePreview(song)}
                  onMouseEnter={playHoverSound}
                >
                  {previewingSong === song.id ? (
                    <div className="stop-preview-wrapper">
                      <svg className="progress-ring" width="24" height="24">
                        <circle
                          className="progress-ring-circle"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="transparent"
                          r="10"
                          cx="12"
                          cy="12"
                          style={{
                            strokeDasharray: `${2 * Math.PI * 10}`,
                            strokeDashoffset: `${2 * Math.PI * 10 * (1 - previewProgress / 100)}`,
                            transform: 'rotate(-90deg)',
                            transformOrigin: '50% 50%',
                            transition: 'stroke-dashoffset 0.1s linear'
                          }}
                        />
                      </svg>
                      <IoStop className="stop-icon" />
                    </div>
                  ) : (
                    <>
                      <IoHeadset className="icon" />
                      Preview
                    </>
                  )}
                </button>

                <button
                  className="action-button play-button"
                  onClick={() => handlePlay(song)}
                  onMouseEnter={playHoverSound}
                >
                  <IoPlay className="icon" />
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <p className="footer-text">Choose a track to start the experience</p>
        </div>
      </div>
    </div>
  );
}

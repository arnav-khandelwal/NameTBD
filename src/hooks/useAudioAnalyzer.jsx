import { useEffect, useRef, useState } from "react";

/**
 * Audio analyzer hook using Web Audio API
 * Analyzes low-frequency amplitude for beat detection
 * Calculates baseline amplitude during first ~10 seconds
 */
export function useAudioAnalyzer(audioUrl) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAmplitude, setCurrentAmplitude] = useState(0);
  const [beatDetected, setBeatDetected] = useState(false);
  
  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  
  // Simple beat detection state
  const previousAmplitudeRef = useRef(0);
  const lastBeatTimeRef = useRef(0);
  const recentAmplitudesRef = useRef([]); // Store recent amplitudes for threshold
  
  // Beat detection tuning
  // We use relative jumps vs recent average to keep things responsive
  const BEAT_THRESHOLD_MULTIPLIER = 1.25; // Amplitude must be ~1.25x recent average
  const BEAT_COOLDOWN = 200; // 200ms between beats
  const LOW_FREQ_START = 0; // Start of low frequency range (index)
  const LOW_FREQ_END = 8; // End of low frequency range (index, ~150Hz at 2048 FFT)
  const RECENT_SAMPLES_COUNT = 20; // Number of recent samples to track

  useEffect(() => {
    // Don't initialize if no audio URL provided
    if (!audioUrl) return;

    // Create audio element
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    contextRef.current = audioContext;

    // Create analyser node
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    // Create data array for frequency data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    // Connect audio source to analyser
    const source = audioContext.createMediaElementSource(audio);
    sourceRef.current = source;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Audio event listeners
    audio.addEventListener("play", () => {
      setIsPlaying(true);
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
    });

    audio.addEventListener("pause", () => {
      setIsPlaying(false);
      // Reset tracking on pause
      previousAmplitudeRef.current = 0;
      recentAmplitudesRef.current = [];
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      previousAmplitudeRef.current = 0;
      recentAmplitudesRef.current = [];
    });

    return () => {
      audio.pause();
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [audioUrl]);

  // Animation loop for audio analysis
  useEffect(() => {
    if (!isPlaying) return;

    let animationId;
    
    const analyze = () => {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      
      if (!analyser || !dataArray) return;

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Calculate amplitude from low frequencies (bass range ~50-150Hz)
      let sum = 0;
      for (let i = LOW_FREQ_START; i < LOW_FREQ_END; i++) {
        sum += dataArray[i];
      }
      const amplitude = sum / (LOW_FREQ_END - LOW_FREQ_START);
      setCurrentAmplitude(amplitude);

      // Track recent amplitudes
      recentAmplitudesRef.current.push(amplitude);
      if (recentAmplitudesRef.current.length > RECENT_SAMPLES_COUNT) {
        recentAmplitudesRef.current.shift();
      }

      // Simple beat detection based on relative amplitude jump
      const now = Date.now();
      const timeSinceLastBeat = now - lastBeatTimeRef.current;
      
      // Calculate average of recent amplitudes
      const recentAverage = recentAmplitudesRef.current.length > 0
        ? recentAmplitudesRef.current.reduce((a, b) => a + b, 0) / recentAmplitudesRef.current.length
        : amplitude;
      
      // Detect beat: current amplitude is significantly higher than recent average
      // AND enough time has passed since last beat
      const threshold = recentAverage * BEAT_THRESHOLD_MULTIPLIER;
      const strongJump = amplitude > threshold;
      const quickJump = amplitude > recentAverage + 12; // extra condition for punchy hits

      if ((strongJump || quickJump) &&
          amplitude > 15 && // Minimum amplitude to avoid background noise
          timeSinceLastBeat > BEAT_COOLDOWN) {
        setBeatDetected(true);
        lastBeatTimeRef.current = now;
        // Reset beat flag after a short delay
        setTimeout(() => setBeatDetected(false), 50);
      }
      
      previousAmplitudeRef.current = amplitude;

      animationId = requestAnimationFrame(analyze);
    };

    analyze();
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return {
    play,
    pause,
    isPlaying,
    audioRef,
    currentAmplitude,
    beatDetected,
  };
}

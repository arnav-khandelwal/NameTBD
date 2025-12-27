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
  
  // Calibration state
  const calibrationSamplesRef = useRef([]);
  const averageAmplitudeRef = useRef(null);
  const calibrationStartTimeRef = useRef(null);
  const lastBeatTimeRef = useRef(0);
  
  const CALIBRATION_DURATION = 10000; // 10 seconds
  const BEAT_THRESHOLD = 1.8; // Current amplitude must be 1.4x average
  const BEAT_COOLDOWN = 300; // 300ms between beats
  const LOW_FREQ_START = 0; // Start of low frequency range (index)
  const LOW_FREQ_END = 8; // End of low frequency range (index, ~150Hz at 2048 FFT)

  useEffect(() => {
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
      calibrationStartTimeRef.current = Date.now();
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
    });

    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => setIsPlaying(false));

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

      // Calibration phase: collect samples for first 10 seconds
      const now = Date.now();
      const calibrationElapsed = now - calibrationStartTimeRef.current;
      
      if (calibrationElapsed < CALIBRATION_DURATION) {
        calibrationSamplesRef.current.push(amplitude);
      } else if (averageAmplitudeRef.current === null) {
        // Calibration complete - calculate average
        const samples = calibrationSamplesRef.current;
        const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
        averageAmplitudeRef.current = avg;
        console.log(`🎵 Calibration complete. Average amplitude: ${avg.toFixed(2)}`);
      }

      // Beat detection (only after calibration)
      if (averageAmplitudeRef.current !== null) {
        const threshold = averageAmplitudeRef.current * BEAT_THRESHOLD;
        const timeSinceLastBeat = now - lastBeatTimeRef.current;
        
        if (amplitude > threshold && timeSinceLastBeat > BEAT_COOLDOWN) {
          setBeatDetected(true);
          lastBeatTimeRef.current = now;
          // Reset beat flag after a short delay
          setTimeout(() => setBeatDetected(false), 50);
        }
      }

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

  const getCalibrationProgress = () => {
    if (!calibrationStartTimeRef.current) return 0;
    const elapsed = Date.now() - calibrationStartTimeRef.current;
    return Math.min(elapsed / CALIBRATION_DURATION, 1);
  };

  return {
    play,
    pause,
    isPlaying,
    currentAmplitude,
    averageAmplitude: averageAmplitudeRef.current,
    beatDetected,
    isCalibrated: averageAmplitudeRef.current !== null,
    calibrationProgress: getCalibrationProgress(),
  };
}

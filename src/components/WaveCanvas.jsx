import { useEffect, useRef } from "react";

/**
 * Wave visualization canvas
 * Renders two wave layers:
 * - Base wave: continuous, scales with audio amplitude
 * - Impact wave: triggered on beat, short-lived pulse
 */
export default function WaveCanvas({ 
  currentAmplitude, 
  beatDetected, 
  isPlaying 
}) {
  const canvasRef = useRef(null);
  const impactWavesRef = useRef([]);
  const hueRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Wave parameters
    const BASE_WAVE_COUNT = 3;
    const WAVE_SPEED = 0.02;
    let time = 0;

    // Neon Christmas colors (in HSL hue values)
    const NEON_COLORS = [
      { hue: 0, name: "red" },       // Neon red
      { hue: 120, name: "green" },   // Neon green
      { hue: 180, name: "cyan" },    // Cyan
      { hue: 240, name: "blue" },    // Neon blue
      { hue: 300, name: "magenta" }, // Magenta
      { hue: 45, name: "gold" },     // Gold
    ];

    const render = () => {
      if (!isPlaying) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += WAVE_SPEED;
      hueRef.current = (hueRef.current + 0.5) % 360; // Cycle colors

      // Scale amplitude to reasonable range (0-100)
      const normalizedAmplitude = Math.min(currentAmplitude / 2, 100);

      // Draw base waves (always present)
      for (let i = 0; i < BASE_WAVE_COUNT; i++) {
        drawWave(ctx, {
          time: time + i * 0.5,
          amplitude: 30 + normalizedAmplitude * 0.5,
          frequency: 0.01 + i * 0.002,
          yOffset: canvas.height / 2 + i * 15,
          color: `hsla(${(hueRef.current + i * 60) % 360}, 100%, 60%, 0.6)`,
          lineWidth: 2,
        });
      }

      // Draw impact waves (triggered on beat)
      impactWavesRef.current = impactWavesRef.current.filter(wave => {
        wave.life -= 0.016; // Decrease life (~60fps)
        
        if (wave.life <= 0) return false; // Remove dead waves

        const alpha = wave.life; // Fade out as life decreases
        drawWave(ctx, {
          time: wave.time,
          amplitude: wave.amplitude * (1 + (1 - wave.life)), // Expand amplitude
          frequency: wave.frequency,
          yOffset: wave.yOffset,
          color: `hsla(${wave.hue}, 100%, 70%, ${alpha})`,
          lineWidth: 4 + (1 - wave.life) * 2, // Get thicker
        });

        wave.time += WAVE_SPEED * 0.5; // Move slower than base wave
        return true;
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isPlaying, currentAmplitude]);

  // Add impact wave on beat
  useEffect(() => {
    if (beatDetected && isPlaying) {
      // Create a strong impact wave
      impactWavesRef.current.push({
        time: Math.random() * 100,
        amplitude: 60 + Math.random() * 40,
        frequency: 0.008 + Math.random() * 0.004,
        yOffset: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
        hue: Math.floor(Math.random() * 360),
        life: 0.5, // 500ms life
      });
    }
  }, [beatDetected, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1, // Behind hand canvas (z-index: 10)
      }}
    />
  );
}

/**
 * Draw a sine wave on the canvas
 */
function drawWave(ctx, { time, amplitude, frequency, yOffset, color, lineWidth }) {
  const width = ctx.canvas.width;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  for (let x = 0; x < width; x++) {
    const y = yOffset + Math.sin(x * frequency + time) * amplitude;
    
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

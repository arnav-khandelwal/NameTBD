import { useEffect, useRef } from "react";

/**
 * Audio visualization canvas
 * - Bottom sound-bar visualizer reacting to audio amplitude
 * - Left-edge glow effect on enemy spawn
 */
export default function WaveCanvas({ 
  currentAmplitude, 
  beatDetected, 
  isPlaying,
  pulsesRef 
}) {
  const canvasRef = useRef(null);
  const glowsRef = useRef([]);
  const barHeightsRef = useRef([]);
  const lastBeatTimeRef = useRef(0);

  // Sound bar parameters
  const BAR_COUNT = 64; // Number of sound bars
  const BAR_GAP = 4; // Gap between bars
  const BAR_BASE_HEIGHT = 5; // Minimum bar height
  const BAR_MAX_HEIGHT = 150; // Maximum bar height

  // Neon Christmas colors (HSL hue values)
  const NEON_COLORS = [0, 120, 180, 240, 300, 45]; // red, green, cyan, blue, magenta, gold

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let hue = 0;

    // Initialize bar heights
    if (barHeightsRef.current.length === 0) {
      barHeightsRef.current = new Array(BAR_COUNT).fill(BAR_BASE_HEIGHT);
    }

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      if (!isPlaying) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cycle hue for color animation
      hue = (hue + 0.5) % 360;

      // Draw sound bars at bottom
      drawSoundBars(ctx, canvas.width, canvas.height, hue);

      // Draw and update glow effects
      glowsRef.current = glowsRef.current.filter(glow => {
        glow.opacity -= 0.015; // Fade out over ~300ms at 60fps
        
        if (glow.opacity <= 0) return false;

        drawLeftGlow(ctx, canvas.height, glow);
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

  // Trigger glow effect on beat/spawn (using pulsesRef as communication channel)
  useEffect(() => {
    if (beatDetected && isPlaying) {
      const now = Date.now();
      if (now - lastBeatTimeRef.current < 100) return;
      lastBeatTimeRef.current = now;

      // Add soft glow for regular beats
      glowsRef.current.push({
        opacity: 0.6,
        strength: 1, // Soft glow
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        width: 80,
      });
    }
  }, [beatDetected, isPlaying]);

  // Listen for strong pulses (enemy spawns) via pulsesRef
  useEffect(() => {
    if (!pulsesRef || !pulsesRef.current) return;

    const interval = setInterval(() => {
      // Check if new strong pulses were added
      const strongPulses = pulsesRef.current.filter(p => p.strength === 2 && p.radius < 10);
      
      if (strongPulses.length > 0) {
        // Add strong glow for enemy spawn
        glowsRef.current.push({
          opacity: 1,
          strength: 2, // Strong glow
          color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
          width: 150,
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [pulsesRef]);

  /**
   * Draw sound bars at the bottom of the screen
   */
  const drawSoundBars = (ctx, width, height, hue) => {
    const barWidth = (width - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT;
    
    // Normalize amplitude to 0-1 range
    const normalizedAmplitude = Math.min(currentAmplitude / 150, 1);
    
    for (let i = 0; i < BAR_COUNT; i++) {
      // Target height based on amplitude with some randomization for visual interest
      const randomFactor = 0.8 + Math.random() * 0.4;
      const targetHeight = BAR_BASE_HEIGHT + (BAR_MAX_HEIGHT * normalizedAmplitude * randomFactor);
      
      // Smooth interpolation (lerp) for bar height
      const currentHeight = barHeightsRef.current[i];
      const lerpFactor = 0.2; // Adjust for smoothness
      barHeightsRef.current[i] = currentHeight + (targetHeight - currentHeight) * lerpFactor;
      
      const x = i * (barWidth + BAR_GAP);
      const y = height - barHeightsRef.current[i];
      
      // Color varies per bar with hue cycling
      const barHue = (hue + i * 5) % 360;
      const gradient = ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, `hsla(${barHue}, 100%, 60%, 0.9)`);
      gradient.addColorStop(1, `hsla(${barHue}, 100%, 40%, 0.7)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeightsRef.current[i]);
      
      // Add glow to bars
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${barHue}, 100%, 60%, 0.5)`;
      ctx.fillRect(x, y, barWidth, barHeightsRef.current[i]);
      ctx.shadowBlur = 0;
    }
  };

  /**
   * Draw glow effect from left edge
   */
  const drawLeftGlow = (ctx, height, glow) => {
    const gradient = ctx.createLinearGradient(0, 0, glow.width, 0);
    
    // Brightness based on strength
    const lightness = glow.strength === 2 ? 70 : 60;
    const alpha = glow.opacity;
    
    gradient.addColorStop(0, `hsla(${glow.color}, 100%, ${lightness}%, ${alpha})`);
    gradient.addColorStop(0.5, `hsla(${glow.color}, 100%, ${lightness}%, ${alpha * 0.5})`);
    gradient.addColorStop(1, `hsla(${glow.color}, 100%, ${lightness}%, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, glow.width, height);
    
    // Add extra glow for strong spawns
    if (glow.strength === 2) {
      ctx.shadowBlur = 40;
      ctx.shadowColor = `hsla(${glow.color}, 100%, 70%, ${alpha * 0.8})`;
      ctx.fillRect(0, 0, glow.width, height);
      ctx.shadowBlur = 0;
    }
  };

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


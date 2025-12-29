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
  //const lastBeatTimeRef = useRef(0);

  // Sound bar parameters
  const BAR_COUNT = 64; // Number of sound bars
  const BAR_GAP = 4; // Gap between bars
  const BAR_BASE_HEIGHT = 5; // Minimum bar height
  const BAR_MAX_HEIGHT = 80; // Maximum bar height

  // Neon Christmas colors (HSL hue values)
  //const NEON_COLORS = [0, 120, 180, 240, 300, 45]; // red, green, cyan, blue, magenta, gold
  const CHRISTMAS_COLORS = {
    gold: "#eece132e",
    red: "#C41E3A",
    green: "#0d7248d7",
    warmWhite: "#fff6d633", // fairy-light white
  mint:      "#4dffcc24", // soft neon green
  amber:     "#ffb7032e",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    //let hue = 0;

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
      //hue = (hue + 0.5) % 360;

      // Draw sound bars at bottom
      drawSoundBars(ctx, canvas.width, canvas.height);

      // Draw and update pop animations
      glowsRef.current = glowsRef.current.filter(glow => {
        // Advance animation progress (0 -> 1)
        glow.age += 0.05; // Slightly slower for a smoother pop

        // Clamp age to [0, 1]
        const t = Math.min(glow.age, 1);

        // Ease-out for radius so it starts fast and settles smoothly
        const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
        const eased = easeOutCubic(t);

        // Radius grows from 0 to maxRadius with easing
        glow.radius = glow.maxRadius * eased;

        // Opacity fades out linearly over the lifetime
        glow.opacity = 1 - t;

        if (t >= 1) return false; // Animation complete

        drawPopAnimation(ctx, glow);
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

  // Regular beats no longer trigger glow - only enemy spawns create portal effect

  // Listen for strong pulses (enemy spawns) via pulsesRef
  useEffect(() => {
    if (!pulsesRef || !pulsesRef.current) return;

    const interval = setInterval(() => {
      // Check if new strong pulses were added and not yet used for glow
      const strongPulses = pulsesRef.current.filter(
        p => p.strength === 2 && !p.usedForGlow
      );

      strongPulses.forEach(pulse => {
        pulse.usedForGlow = true; // Mark so we only pop once per spawn

        // Add a small, elegant pop at spawn position
        glowsRef.current.push({
          opacity: 1,
          //color: pulse.color || NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
          color: pulse.color || 45, // default to gold
          spawnY: pulse.spawnY || window.innerHeight / 2,
          radius: 0, // Start at 0 and expand
          maxRadius: 40, // Small radius for subtle effect
          age: 0, // Animation progress 0 -> 1
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [pulsesRef]);

  /**
   * Draw sound bars at the bottom of the screen
   */
  const drawSoundBars = (ctx, width, height) => {
    const barWidth = (width - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT;

    // Normalize amplitude to 0-1 range
    const normalizedAmplitude = Math.min(currentAmplitude / 150, 1);

    for (let i = 0; i < BAR_COUNT; i++) {
      // Target height based on amplitude with some randomization for visual interest
      const randomFactor = 0.8 + Math.random() * 0.4;
      //const targetHeight = BAR_BASE_HEIGHT + (BAR_MAX_HEIGHT * normalizedAmplitude * randomFactor);
      const beatBoost = beatDetected ? 1.3 : 1;

      const targetHeight =
        BAR_BASE_HEIGHT +
        BAR_MAX_HEIGHT * normalizedAmplitude * randomFactor * beatBoost;

      // Smooth interpolation (lerp) for bar height
      const currentHeight = barHeightsRef.current[i];
      const lerpFactor = 0.2; // Adjust for smoothness
      barHeightsRef.current[i] = currentHeight + (targetHeight - currentHeight) * lerpFactor;

      const x = i * (barWidth + BAR_GAP);
      const y = height - barHeightsRef.current[i];

      // Color varies per bar with hue cycling
      /*const barHue = (hue + i * 5) % 360;
      const gradient = ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, `hsla(${barHue}, 100%, 60%, 0.9)`);
      gradient.addColorStop(1, `hsla(${barHue}, 100%, 40%, 0.7)`);
      */

      let barColor = CHRISTMAS_COLORS.warmWhite;

      // louder sound → green
      if (normalizedAmplitude == 1) {
        barColor = Math.random() < 0.5
    ? CHRISTMAS_COLORS.green
    : CHRISTMAS_COLORS.red;
      }
      else if(normalizedAmplitude==0.9){
        barColor = CHRISTMAS_COLORS.green;
      }
      else if (normalizedAmplitude==0.8||normalizedAmplitude==0.4){
        barColor=CHRISTMAS_COLORS.amber
      }
      else if (normalizedAmplitude > 0.6) {
        barColor = CHRISTMAS_COLORS.red;
      }
      else if(normalizedAmplitude >0.4){
        barColor = CHRISTMAS_COLORS.green;
      }
      if (beatDetected) {
        barColor = CHRISTMAS_COLORS.gold;
      }

      const gradient = ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, barColor);
      gradient.addColorStop(1, "rgba(0,0,0,0.2)");

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeightsRef.current[i]);

      // Add glow to bars
      /*ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${barHue}, 100%, 60%, 0.5)`;*/
      ctx.shadowBlur = beatDetected ? 25 : 12;
      ctx.shadowColor = barColor;

      ctx.fillRect(x, y, barWidth, barHeightsRef.current[i]);
      ctx.shadowBlur = 0;
      
    }
  };

  const drawPopAnimation = (ctx, glow) => {
    const centerX = 0; // On the left edge
    const centerY = glow.spawnY;
    const alpha = glow.opacity;
    const radius = glow.radius;

    // Half-sphere fill (only inside the play area, to the right)
    // Use a true radial gradient centered on the spawn point
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, `hsla(${glow.color}, 100%, 80%, ${alpha * 0.7})`);
    gradient.addColorStop(1, `hsla(${glow.color}, 100%, 60%, 0)`);

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    // Draw a right-facing half-circle (from top to bottom)
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
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
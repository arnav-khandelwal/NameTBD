import { useEffect, useRef } from "react";
import "./Minimap.css";

export default function Minimap({ enemies, hand }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const MAX_RANGE = 15; // Match SPAWN_RADIUS in useEnemies
    const MAX_RADIUS_PIXELS = 75; // Slightly inside outer circle (80)
    const scale = MAX_RADIUS_PIXELS / MAX_RANGE;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 255, 255, 0.46)";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Draw concentric circles for depth perception
    ctx.strokeStyle = "rgba(0, 255, 255, 0.25)";
    ctx.lineWidth = 1.1;
    for (let r = 20; r < 80; r += 20) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw cardinal direction lines
    ctx.strokeStyle = "rgba(0, 255, 255, 0.25)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 80);
    ctx.lineTo(centerX, centerY + 80);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY);
    ctx.lineTo(centerX + 80, centerY);
    ctx.stroke();

    // Draw enemies as red dots
    if (enemies && enemies.length > 0) {
      enemies.forEach(enemy => {
        const x = enemy.position[0];
        const z = enemy.position[2];
        const dist = Math.sqrt(x * x + z * z);

        // Clamp to minimap radius so distant enemies stay visible at the edge
        const clampedDist = Math.min(dist, MAX_RANGE);
        const ratio = clampedDist / MAX_RANGE;
        const displayRadius = ratio * MAX_RADIUS_PIXELS;
        const angle = Math.atan2(z, x); // X right, Z down

        const enemyX = centerX + Math.cos(angle) * displayRadius;
        const enemyY = centerY + Math.sin(angle) * displayRadius;

        // Draw enemy dot
        ctx.beginPath();
        ctx.arc(enemyX, enemyY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 96, 96, 0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 180, 180, 0.9)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }

    // Draw player at center (blue dot)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(120, 160, 255, 0.98)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 200, 255, 0.95)";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Draw direction arrow
    if (hand?.active) {
      const angle = (hand.x - 0.5) * Math.PI * 4; // Match CameraRig calculation
      const arrowLength = 15;
      const arrowX = centerX + Math.sin(angle) * arrowLength;
      const arrowY = centerY - Math.cos(angle) * arrowLength;

      // Draw line from player
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(arrowX, arrowY);
      ctx.strokeStyle = "rgba(0, 255, 255, 0.96)";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Draw arrowhead
      const headSize = 6;
      const headAngle1 = angle + Math.PI * 0.8;
      const headAngle2 = angle - Math.PI * 0.8;
      
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX + Math.sin(headAngle1) * headSize,
        arrowY - Math.cos(headAngle1) * headSize
      );
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX + Math.sin(headAngle2) * headSize,
        arrowY - Math.cos(headAngle2) * headSize
      );
      ctx.strokeStyle = "rgba(0, 255, 255, 0.96)";
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }
  }, [enemies, hand]);

  return (
    <div className="minimap-shell">
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="minimap-canvas"
      />
      <div
        className="minimap-label"
      >
        Minimap
      </div>
    </div>
  );
}

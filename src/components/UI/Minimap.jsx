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
    const scale = 8; // Scale factor: 1 world unit = 8 pixels

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw concentric circles for depth perception
    ctx.strokeStyle = "rgba(0, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    for (let r = 20; r < 80; r += 20) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw cardinal direction lines
    ctx.strokeStyle = "rgba(0, 255, 255, 0.15)";
    ctx.lineWidth = 1;
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
        // Convert 3D position to 2D minimap coordinates
        const enemyX = centerX + enemy.position[0] * scale;
        const enemyZ = centerY + enemy.position[2] * scale;

        // Draw enemy dot
        ctx.beginPath();
        ctx.arc(enemyX, enemyZ, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ff4444";
        ctx.fill();
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw player at center (blue dot)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#4444ff";
    ctx.fill();
    ctx.strokeStyle = "#0088ff";
    ctx.lineWidth = 2;
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
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
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
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
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

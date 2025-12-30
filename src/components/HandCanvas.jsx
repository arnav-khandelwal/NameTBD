import { useEffect, useRef } from "react";

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
];

export default function HandCanvas({ landmarks, fire, isGameActive }) {
  const canvasRef = useRef(null);
  const SHOW_HAND = false;
  useEffect(() => {
    if (!isGameActive) return;
    if (!SHOW_HAND) return; 
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!landmarks) return;

    const FIRE_COLOR = "#ffcc00";

    ctx.lineWidth = 2;
    if (SHOW_HAND) {
      ctx.strokeStyle = fire ? FIRE_COLOR : "#333";

      landmarks.forEach((p, i) => {
        let color = "#555";

        if (!fire) {
          if ([1, 2, 3, 4].includes(i)) color = "#ff4d4d";
          if ([5, 6, 7, 8].includes(i)) color = "#00ffff";
          if ([9, 10, 11, 12].includes(i)) color = "#00ff66";
        } else {
          color = FIRE_COLOR;
        }

        ctx.beginPath();
        ctx.arc(
          (1 - p.x) * canvas.width,
          p.y * canvas.height,
          fire ? 7 : 6,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = color;
        ctx.fill();
      
      });
    }
    }, [landmarks, fire, isGameActive]);

if (!isGameActive) return;
return (
  <canvas
    ref={canvasRef}
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 10,
    }}
  />
);
}

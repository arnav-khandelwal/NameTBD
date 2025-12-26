import { useEffect, useRef } from "react";

const HAND_CONNECTIONS = [
  // Thumb
  [0,1],[1,2],[2,3],[3,4],
  // Index
  [0,5],[5,6],[6,7],[7,8],
  // Middle
  [0,9],[9,10],[10,11],[11,12],
  // Ring
  [0,13],[13,14],[14,15],[15,16],
  // Pinky
  [0,17],[17,18],[18,19],[19,20],
];

export default function HandCanvas({ landmarks, aim, fire }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks) return;

    const boneColor = fire ? "#efe223ff" : aim ? "#00ffff" : "#666";
    const jointColor = fire ? "#efe223ff" : "#00ffff";

    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 2;

    HAND_CONNECTIONS.forEach(([a, b]) => {
      const p1 = landmarks[a];
      const p2 = landmarks[b];

      const x1 = (1 - p1.x) * canvas.width; 
      const y1 = p1.y * canvas.height;
      const x2 = (1 - p2.x) * canvas.width;
      const y2 = p2.y * canvas.height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    landmarks.forEach((p, i) => {
      const x = (1 - p.x) * canvas.width;
      const y = p.y * canvas.height;

      ctx.beginPath();
      ctx.arc(
        x,
        y,
        i === 8 || i === 12 ? 7 : 4, 
        0,
        Math.PI * 2
      );
      ctx.fillStyle = jointColor;
      ctx.fill();
    });
  }, [landmarks, aim, fire]);

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

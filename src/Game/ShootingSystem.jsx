import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import LaserBolt from "./LaserBolt";

export default function ShootingSystem({ hand, setScore }) {
  const [lasers, setLasers] = useState([]);
  const lastShot = useRef(0);

  const FIRE_RATE = 400; // ms

  // fire control (machine gun)
  useFrame(() => {
    if (!hand?.fire) return;

    const now = performance.now();
    if (now - lastShot.current > FIRE_RATE) {
      setLasers(l => [...l, crypto.randomUUID()]);
      lastShot.current = now;
    }
  });

  // called when laser hits something
  function handleHit(enemy, laserId) {
    if (enemy) {
      enemy.userData.health -= 25;

      if (enemy.userData.health <= 0) {
        enemy.visible = false;
        setScore(s => s + 1);
      }
    }

    // remove laser after hit or timeout
    setLasers(l => l.filter(id => id !== laserId));
  }

  return (
    <>
      {lasers.map(id => (
        <LaserBolt
          key={id}
          id={id}
          onHit={handleHit}
        />
      ))}
    </>
  );
}

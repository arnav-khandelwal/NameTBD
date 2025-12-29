import { useState, useEffect, useRef } from "react";
import krampusImg from "../assets/enemy_sprites/krampus_new.png";
import gremlinImg from "../assets/enemy_sprites/gremlin_new.png";

// Use paths relative to your public folder or src/assets
const ENEMY_IMAGES = [krampusImg, gremlinImg];
const ENEMY_SPEED = 0.045; // 3D units per frame
const SPAWN_RADIUS = 20; // Distance from center where enemies spawn
const KILL_RADIUS = 2; // Distance at which enemies die (reach player)

export function useEnemies(beatDetected, isPlaying, onEnemySpawn) {
  const [enemies, setEnemies] = useState([]);
  const nextIdRef = useRef(0);

  // 1. Spawn enemy on beat - spawn in a circle around the player
  useEffect(() => {
    if (beatDetected && isPlaying) {
      setEnemies(prev => {
        const MIN_Y_DISTANCE = 0.5; // Minimum vertical distance in 3D units
        let randomY;
        let validPosition = false;
        let attempts = 0;

        // Try to find a Y position that doesn't overlap with existing enemies
        // Y range from 0.4 to 0.8 (ground level to head height)
        while (!validPosition && attempts < 10) {
          randomY = Math.random() * 0.2 + 0.4;
          validPosition = prev.every(enemy => Math.abs(enemy.position[1] - randomY) >= MIN_Y_DISTANCE);
          attempts++;
        }

        // If we couldn't find a valid position after 10 attempts, use the random position anyway
        if (attempts === 10) {
          randomY = Math.random() * 0.2 + 0.4;
        }

        const randomImg = ENEMY_IMAGES[Math.floor(Math.random() * ENEMY_IMAGES.length)];

        // Spawn in a circle around the player (center at 0, 0)
        const angle = Math.random() * Math.PI * 2; // Random angle 0-360 degrees
        const spawnX = Math.cos(angle) * SPAWN_RADIUS;
        const spawnZ = Math.sin(angle) * SPAWN_RADIUS;

        // Calculate direction vector towards center (0, y, 0)
        const dirX = -spawnX;
        const dirZ = -spawnZ;
        const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
        const normalizedDirX = dirX / length;
        const normalizedDirZ = dirZ / length;
        const isKrampus = randomImg === krampusImg;
        const newEnemy = {
          id: nextIdRef.current++,
          position: [spawnX, randomY, spawnZ], // [x, y, z] - spawn at radius
          direction: [normalizedDirX, 0, normalizedDirZ], // Normalized direction towards center
          image: randomImg,
          size: isKrampus ? 1.2 : 0.9,
          health: isKrampus ? 50 : 25,
          maxHealth: isKrampus ? 50 : 25,
        };

        if (onEnemySpawn) onEnemySpawn(randomY);
        return [...prev, newEnemy];
      });
    }
  }, [beatDetected, isPlaying, onEnemySpawn]);

  // 2. Combined Update and Cleanup Effect
  useEffect(() => {
    if (!isPlaying) {
      setEnemies([]); // Clears enemies immediately when stopped
      return;
    }

    let raf;
    const update = () => {
      setEnemies(prev =>
        prev
          .map(enemy => ({
            ...enemy,
            position: [
              enemy.position[0] + enemy.direction[0] * ENEMY_SPEED,
              enemy.position[1],
              enemy.position[2] + enemy.direction[2] * ENEMY_SPEED,
            ],
          }))
          .filter(enemy => {
            const dx = enemy.position[0];
            const dz = enemy.position[2];
            return Math.sqrt(dx * dx + dz * dz) > KILL_RADIUS;
          })
      );
      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  return { enemies };
}
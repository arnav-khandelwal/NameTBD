import { useState, useEffect, useRef } from "react";
import krampusImg from "../assets/enemy_sprites/krampus.png";
import gremlinImg from "../assets/enemy_sprites/gremlin.png";
import ghostImg from "../assets/enemy_sprites/ghostImg.png"
import elfBoss from "../assets/enemy_sprites/elfBoss.png"
import reaperBoss from "../assets/enemy_sprites/reaperBoss.png"
import orcBoss from "../assets/enemy_sprites/orcBoss.png"
// Use paths relative to your public folder or src/assets
const ENEMY_IMAGES = [krampusImg, gremlinImg, ghostImg];
const BOSS_IMAGES = [elfBoss, reaperBoss, orcBoss];
const ENEMY_SPEED = 0.045; // 3D units per frame
const SPAWN_RADIUS = 15; // Distance from center where enemies spawn
const KILL_RADIUS = 2; // Distance at which enemies die (reach player)

export function useEnemies(beatDetected, isPlaying, onEnemySpawn , onEnemyHitPlayer) {
  const [enemies, setEnemies] = useState([]);
  const nextIdRef = useRef(0);
  const lastBossSpawnRef = useRef(Date.now());// Tracks time for the 1-minute boss
  // Helper to spawn a boss
  const spawnBoss = () => {
    lastBossSpawnRef.current = Date.now();
    setEnemies(prev => {
      const angle = Math.random() * Math.PI * 2;
      const spawnX = Math.cos(angle) * SPAWN_RADIUS;
      const spawnZ = Math.sin(angle) * SPAWN_RADIUS;

      const bossImg = BOSS_IMAGES[Math.floor(Math.random() * BOSS_IMAGES.length)];

      const bossEnemy = {
        id: nextIdRef.current++,
        position: [spawnX, 0.6, spawnZ], // Bosses spawn a bit higher/grounded
        direction: [-spawnX / SPAWN_RADIUS, 0, -spawnZ / SPAWN_RADIUS],
        type: "BOSS",
        image: bossImg,
        size: 3,            // bigger than minions
        health: 500,          // 10x normal Krampus health (50 * 10)
        maxHealth: 500,
        isBoss: true          // Flag for potential special effects
      };

      if (onEnemySpawn) onEnemySpawn(0.6);
      return [...prev, bossEnemy];
    });
  };

  // 1. Minute Timer for Boss
  useEffect(() => {
    if (!isPlaying) return;


    const bossCheckInterval = setInterval(() => {
      const now = Date.now();
      // Check if 60 seconds (60000ms) have passed
      if (now - lastBossSpawnRef.current >= 60000) {
        spawnBoss(now);
      }
    }, 1000); // Check every second

    return () => clearInterval(bossCheckInterval);
  }, [isPlaying]);

  const damageEnemy = (id, dmg) => {
    setEnemies(prev =>
      prev
        .map(e =>
          e.id === id
            ? { ...e, health: e.health - dmg }
            : e
        )
        .filter(e => e.health > 0)
    );
  };

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
        const isgremlin = randomImg === gremlinImg;
        const newEnemy = {
          id: nextIdRef.current++,
          position: [spawnX, randomY, spawnZ], // [x, y, z] - spawn at radius
          direction: [normalizedDirX, 0, normalizedDirZ], // Normalized direction towards center
          type: randomImg.split("/").pop().replace(".png", ""),
          image: randomImg,
          size: isKrampus ? 1.2 : isgremlin ? 1 : 0.9,
          health: isKrampus ? 75 : isgremlin ? 50 : 25,
          maxHealth: isKrampus ? 75 : isgremlin ? 50 : 25,
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
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist <= KILL_RADIUS) {
              onEnemyHitPlayer?.(enemy);
              return false;
            }

            return true;

          })
      );
      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  return { enemies, damageEnemy };
}
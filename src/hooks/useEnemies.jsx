import { useState, useEffect, useRef } from "react";
import krampusImg from "../assets/enemy_sprites/krampus.png";
import gremlinImg from "../assets/enemy_sprites/gremlin.png";
import ghostImg from "../assets/enemy_sprites/ghostImg.png"
import reaperBoss from "../assets/enemy_sprites/reaperBoss.png"
import orcBoss from "../assets/enemy_sprites/orcBoss.png"
// Use paths relative to your public folder or src/assets
const ENEMY_IMAGES = [krampusImg, gremlinImg, ghostImg];
const BOSS_IMAGES = [reaperBoss, orcBoss];
const ENEMY_SPEED = 0.045; // 3D units per frame
const SPAWN_RADIUS = 15; // Distance from center where enemies spawn
const KILL_RADIUS = 2; // Distance at which enemies die (reach player)
const SCOPE_CENTER_Y = 0.8; // The Y position of scope center (camera target)
const HARMONIC_AMPLITUDE = 0.15; // Maximum vertical oscillation from center
const HARMONIC_FREQUENCY = 0.05; // Speed of oscillation

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
        position: [spawnX, SCOPE_CENTER_Y, spawnZ], // Spawn at scope center
        direction: [-spawnX / SPAWN_RADIUS, 0, -spawnZ / SPAWN_RADIUS],
        type: "BOSS",
        image: bossImg,
        size: 3,            // bigger than minions
        health: 500,          // 10x normal Krampus health (50 * 10)
        maxHealth: 500,
        isBoss: true,          // Flag for potential special effects
        harmonicPhase: Math.random() * Math.PI * 2, // Random starting phase for harmonic motion
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
          position: [spawnX, SCOPE_CENTER_Y, spawnZ], // Spawn at scope center Y
          direction: [normalizedDirX, 0, normalizedDirZ], // Normalized direction towards center
          type: randomImg.split("/").pop().replace(".png", ""),
          image: randomImg,
          size: isKrampus ? 1.2 : isgremlin ? 1 : 0.9,
          health: isKrampus ? 75 : isgremlin ? 50 : 25,
          maxHealth: isKrampus ? 75 : isgremlin ? 50 : 25,
          harmonicPhase: Math.random() * Math.PI * 2, // Random starting phase for harmonic motion
        };

        if (onEnemySpawn) onEnemySpawn(SCOPE_CENTER_Y);
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
          .map(enemy => {
            // Update harmonic phase
            const newPhase = enemy.harmonicPhase + HARMONIC_FREQUENCY;
            
            // Calculate Y position with harmonic motion centered at SCOPE_CENTER_Y
            const harmonicY = SCOPE_CENTER_Y + Math.sin(newPhase) * HARMONIC_AMPLITUDE;
            
            return {
              ...enemy,
              position: [
                enemy.position[0] + enemy.direction[0] * ENEMY_SPEED,
                harmonicY, // Use harmonic Y position
                enemy.position[2] + enemy.direction[2] * ENEMY_SPEED,
              ],
              harmonicPhase: newPhase,
            };
          })
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
import { useState, useEffect, useRef } from "react";
import krampusImg from "../assets/enemy_sprites/krampus_new.png";
import gremlinImg from "../assets/enemy_sprites/gremlin_new.png";

// Use paths relative to your public folder or src/assets
const ENEMY_IMAGES = [krampusImg, gremlinImg];
const ENEMY_SPEED = 2;

export function useEnemies(beatDetected, isPlaying, onEnemySpawn) {
  const [enemies, setEnemies] = useState([]);
  const nextIdRef = useRef(0);
  const screenWidthRef = useRef(typeof window !== "undefined" ? window.innerWidth : 1920);

  // 1. Spawn enemy on beat with minimum distance check
  useEffect(() => {
    if (beatDetected && isPlaying) {
      setEnemies(prev => {
        const MIN_Y_DISTANCE = 150; // Minimum vertical distance between enemies
        let randomY;
        let validPosition = false;
        let attempts = 0;
        
        // Try to find a Y position that doesn't overlap with existing enemies
        while (!validPosition && attempts < 10) {
          randomY = Math.random() * (window.innerHeight - 100) + 50;
          validPosition = prev.every(enemy => Math.abs(enemy.y - randomY) >= MIN_Y_DISTANCE);
          attempts++;
        }
        
        // If we couldn't find a valid position after 10 attempts, use the random position anyway
        if (attempts === 10) {
          randomY = Math.random() * (window.innerHeight - 100) + 50;
        }
        
        const randomImg = ENEMY_IMAGES[Math.floor(Math.random() * ENEMY_IMAGES.length)];
        
        const newEnemy = {
          id: nextIdRef.current++,
          x: 0, 
          y: randomY,
          image: randomImg, // Changed from 'emoji' to 'image' to match your renderer
          size: 60 + Math.random() * 40, // Increased size: images need more room than emojis
        };
        
        if (onEnemySpawn) onEnemySpawn(randomY);
        return [...prev, newEnemy];
      });
    }
  }, [beatDetected, isPlaying, onEnemySpawn]);

  // 2. Combined Update and Cleanup Effect (Fixes ESLint Error)
  useEffect(() => {
    if (!isPlaying) {
      setEnemies([]); // Clears enemies immediately when stopped
      return;
    }

    let animationId;
    const updateEnemies = () => {
      setEnemies(prev => {
        if (prev.length === 0) return prev;
        return prev
          .map(enemy => ({ ...enemy, x: enemy.x + ENEMY_SPEED }))
          .filter(enemy => enemy.x < screenWidthRef.current + 100);
      });
      animationId = requestAnimationFrame(updateEnemies);
    };

    animationId = requestAnimationFrame(updateEnemies);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  return { enemies };
}
import { useState, useEffect, useRef } from "react";

/**
 * Enemy manager hook
 * Spawns enemies on beat and moves them across the screen
 */
export function useEnemies(beatDetected, isPlaying) {
  const [enemies, setEnemies] = useState([]);
  const nextIdRef = useRef(0);

  // Enemy movement speed (pixels per frame at 60fps)
  const ENEMY_SPEED = 3;
  const SCREEN_WIDTH = typeof window !== "undefined" ? window.innerWidth : 1920;
  
  // Emoji options for enemies
  const ENEMY_EMOJIS = ["🎄", "🎅", "⛄", "🎁", "⭐", "🔔", "🕯️", "❄️"];

  // Spawn enemy on beat
  useEffect(() => {
    if (beatDetected && isPlaying) {
      const randomY = Math.random() * (window.innerHeight - 100) + 50;
      const randomEmoji = ENEMY_EMOJIS[Math.floor(Math.random() * ENEMY_EMOJIS.length)];
      
      const newEnemy = {
        id: nextIdRef.current++,
        x: 0, // Start at left edge
        y: randomY,
        emoji: randomEmoji,
        size: 40 + Math.random() * 20, // Random size between 40-60px
      };
      
      setEnemies(prev => [...prev, newEnemy]);
    }
  }, [beatDetected, isPlaying]);

  // Update enemy positions and remove off-screen enemies
  useEffect(() => {
    if (!isPlaying) return;

    let animationId;
    
    const updateEnemies = () => {
      setEnemies(prev => {
        // Move enemies right and filter out off-screen ones
        return prev
          .map(enemy => ({
            ...enemy,
            x: enemy.x + ENEMY_SPEED,
          }))
          .filter(enemy => enemy.x < SCREEN_WIDTH + 100); // Keep some margin
      });
      
      animationId = requestAnimationFrame(updateEnemies);
    };

    updateEnemies();
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  // Clear all enemies when music stops
  useEffect(() => {
    if (!isPlaying) {
      setEnemies([]);
    }
  }, [isPlaying]);

  return { enemies };
}

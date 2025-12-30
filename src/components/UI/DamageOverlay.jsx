import { useEffect, useState } from 'react';
import './DamageOverlay.css';

export default function DamageOverlay({ damage }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (damage > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500); // Red overlay lasts 500ms

      return () => clearTimeout(timer);
    }
  }, [damage]);

  if (!isVisible) return null;

  return (
    <div className="damage-overlay" />
  );
}

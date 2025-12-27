/**
 * Simple enemy renderer
 * Displays enemies as emoji characters positioned absolutely
 */
export default function EnemyRenderer({ enemies }) {
  return (
    <>
      {enemies.map(enemy => (
        <div
          key={enemy.id}
          style={{
            position: "fixed",
            left: enemy.x,
            top: enemy.y,
            fontSize: enemy.size,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 5,
            textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
          }}
        >
          {enemy.emoji}
        </div>
      ))}
    </>
  );
}

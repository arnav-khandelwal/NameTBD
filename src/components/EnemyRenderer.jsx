export default function EnemyRenderer({ enemies }) {
  if (!enemies || enemies.length === 0) return null;

  return (
    <>
      {enemies.map((enemy) => (
        <img
          key={enemy.id}
          src={enemy.image}
          alt="enemy"
          style={{
            position: "fixed", // Changed to fixed to stay relative to the screen
            left: `${enemy.x}px`,
            top: `${enemy.y}px`,
            width: `${enemy.size}px`,
            height: "auto",
            pointerEvents: "none",
            zIndex: 10, // Ensure they are above the background
            transform: "translate(-50%, -50%)", // Centers the image on its coordinates
          }}
        />
      ))}
    </>
  );
}

import "../components/UI/HealthBar.css";

export default function HealthBar({ hp , maxHp }) {
  const ratio = Math.max(0, hp / maxHp);
  const getHealthColor = () => {
    if (hp > maxHp * 0.6) return "#2dbf1f"; // green
    if (hp > maxHp * 0.3) return "#ffcc00"; // yellow
    return "#ff3333";                       // red
  };


  return (
    <div className="health-container">
      <div className="hp-label">{hp}HP</div>
      <div className="bar-wrapper">
        <div 
          className="bar-fill" 
          style={{
            transform: `scaleX(${ratio})`,
            backgroundColor: getHealthColor(),
            boxShadow: `0 0 12px ${getHealthColor()}`,
          }}
        />
        <div className="bar-segments"></div>
      </div>
    </div>
  );
}
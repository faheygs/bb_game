import React from "react";
import { useGameStore } from "../../stores/gameStore";

const HealthBar = () => {
  const health = useGameStore((state) => state.health);

  return (
    <div className="health-bar">
      <div className="health-bar-inner" style={{ width: `${health}%` }} />
    </div>
  );
};

export default HealthBar;

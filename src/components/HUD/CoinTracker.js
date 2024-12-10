import React from "react";
import { useGameStore } from "../../stores/gameStore";

const CoinTracker = () => {
  const coins = useGameStore((state) => state.coins);

  return (
    <div className="coin-tracker">
      <span>💰</span>
      <span>{coins}</span>
    </div>
  );
};

export default CoinTracker;

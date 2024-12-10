import React from "react";
import Avatar from "./Avatar";
import CoinTracker from "./CoinTracker";
import HealthBar from "./HealthBar";
import "./HUD.css"; // Import HUD-specific styles

const HUD = () => {
  return (
    <div className="hud-container">
      {/* Top-Right Section */}
      <div className="hud-top-right">
        <CoinTracker />
        <Avatar />
      </div>

      {/* Bottom-Left Section */}
      <div className="hud-bottom-left">
        <HealthBar />
      </div>
    </div>
  );
};

export default HUD;

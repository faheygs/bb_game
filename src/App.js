import React from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";

import Player from "./components/Player";
import Environment from "./components/Environment";
import Camera from "./components/Camera";
import HUD from "./components/HUD/HUD";
import RV from "./components/RV";
import useInputHandler from "./hooks/useInputHandler";
import { useGameStore } from "./stores/gameStore";

const App = () => {
  // Activate input handling
  useInputHandler();

  // Access global game state
  const gameMode = useGameStore((state) => state.gameMode); // "walking" or "driving"
  const rvDimensions = [3, 3, 6]; // RV width, height, depth

  return (
    <div className="canvas-container">
      <Canvas shadows>
        {/* Lights */}
        <ambientLight intensity={1} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          castShadow
        />
        <Physics gravity={[0, -9.81, 0]}>
          {/* Game Objects */}
          <Environment />
          {/* Custom Camera */}
          <Camera offset={[0, 6, 12]} />
          {gameMode === "walking" && <Player rvDimensions={rvDimensions} />}
          <RV />
        </Physics>
      </Canvas>

      {/* HUD */}
      <HUD />
    </div>
  );
};

export default App;

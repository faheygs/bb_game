import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGameStore } from "../stores/gameStore";
import * as THREE from "three";

const Camera = ({ offset = [0, 5, 15] }) => {
  const cameraRef = useRef();
  const playerPosition = useGameStore((state) => state.playerPosition); // Global player position
  const playerRotation = useGameStore((state) => state.playerRotation); // Global player rotation
  const rvPosition = useGameStore((state) => state.rvPosition); // Global RV position
  const rvRotation = useGameStore((state) => state.rvRotation); // Global RV rotation
  const gameMode = useGameStore((state) => state.gameMode); // Current game mode ("walking" or "driving")
  const { set } = useThree();

  // Memoize the offset vector to avoid recalculating every frame
  const offsetVector = useMemo(() => new THREE.Vector3(...offset), [offset]);

  // Set the custom camera as the active camera in the scene
  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
    }
  }, [set]);

  useFrame(() => {
    if (!cameraRef.current) return;

    let targetPosition;
    let rotation;

    // Determine the target position based on the game mode
    if (gameMode === "walking") {
      // Walking mode: Use the player’s position and rotation
      targetPosition = new THREE.Vector3(...playerPosition);

      if (playerRotation) {
        rotation = new THREE.Euler(
          playerRotation[0],
          playerRotation[1],
          playerRotation[2],
          "XYZ"
        );
      } else {
        rotation = new THREE.Euler(0, 0, 0); // Default to zero rotation if not available
      }
    } else {
      // Driving mode: Use the RV’s position and rotation
      targetPosition = new THREE.Vector3(...rvPosition);

      if (rvRotation) {
        rotation = new THREE.Euler(
          rvRotation[0],
          rvRotation[1],
          rvRotation[2],
          "XYZ"
        );
      } else {
        rotation = new THREE.Euler(0, 0, 0); // Default to zero rotation if not available
      }
    }

    if (!targetPosition) return; // Guard against undefined positions

    // Apply the current rotation (player or RV) to the camera's offset
    const cameraOffset = offsetVector.clone();
    cameraOffset.applyEuler(rotation); // Apply the rotation to the offset

    // Calculate the final camera position
    const finalPosition = targetPosition.clone().add(cameraOffset);

    // Smoothly interpolate the camera position
    cameraRef.current.position.lerp(finalPosition, 0.1);

    // Make the camera look at the target (player or RV)
    cameraRef.current.lookAt(targetPosition);
  });

  return <perspectiveCamera ref={cameraRef} makeDefault />;
};

export default Camera;

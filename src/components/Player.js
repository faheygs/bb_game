import React, { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBox } from "@react-three/cannon";
import { useGameStore } from "../stores/gameStore";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const Player = ({ rvDimensions }) => {
  const [ref, api] = useBox(() => ({
    position: [0, 0.5, 0],
    args: [1, 1, 1], // Player dimensions
    mass: 1,
    linearDamping: 0.5, // Smooth linear movement
    angularDamping: 0.9, // Smooth angular movement
    angularFactor: [0, 1, 0], // Allow rotation only around Y-axis
    userData: { type: "player" },
  }));

  const [showMessage, setShowMessage] = useState(false);

  const updatePlayerPosition = useGameStore(
    (state) => state.updatePlayerPosition
  );
  const updatePlayerRotation = useGameStore(
    (state) => state.updatePlayerRotation
  );
  const pRotation = useGameStore((state) => state.playerRotation);
  const rvPosition = useGameStore((state) => state.rvPosition);
  const gameMode = useGameStore((state) => state.gameMode);
  const keys = useGameStore((state) => state.keys); // Access key states
  const playerPosition = useGameStore((state) => state.playerPosition); // Global player position
  const isInsideRV = useGameStore((state) => state.isInsideRV); // Player state (inside RV or not)
  const setIsInsideRV = useGameStore((state) => state.setIsInsideRV);
  const setGameMode = useGameStore((state) => state.setGameMode); // Update game mode

  const rotationRef = useRef(new THREE.Quaternion()); // Store player's current rotation

  // Track player position and update global state
  useEffect(() => {
    const unsubscribe = api.position.subscribe((position) => {
      updatePlayerPosition(position); // Update the global player position
    });
    return () => unsubscribe();
  }, [api.position, updatePlayerPosition]);

  // Track player rotation and update global state
  useEffect(() => {
    const unsubscribe = api.quaternion.subscribe(([x, y, z, w]) => {
      rotationRef.current.set(x, y, z, w); // Update player's rotation quaternion
      const euler = new THREE.Euler().setFromQuaternion(rotationRef.current); // Convert quaternion to Euler angles
      updatePlayerRotation([euler.x, euler.y, euler.z]); // Update global player rotation
    });
    return () => unsubscribe();
  }, [api.quaternion, updatePlayerRotation]);

  // Check if the player is near the RV
  useEffect(() => {
    if (!rvPosition || !rvDimensions) return;

    const halfRV = rvDimensions.map((dim) => dim / 2); // Half-dimensions of the RV
    const halfPlayer = [0.5, 0.5, 0.5]; // Half-dimensions of the player (from `args` in `useBox`)

    const distanceX =
      Math.abs(playerPosition[0] - rvPosition[0]) - (halfRV[0] + halfPlayer[0]);
    const distanceY =
      Math.abs(playerPosition[1] - rvPosition[1]) - (halfRV[1] + halfPlayer[1]);
    const distanceZ =
      Math.abs(playerPosition[2] - rvPosition[2]) - (halfRV[2] + halfPlayer[2]);

    // Check if any distance is within the 2-unit threshold
    const isWithinProximity =
      (distanceX <= 2 && distanceX >= 0) ||
      (distanceY <= 2 && distanceY >= 0) ||
      (distanceZ <= 2 && distanceZ >= 0);

    setShowMessage(isWithinProximity);
  }, [playerPosition, rvPosition, rvDimensions]);

  // Handle Player movement and turning
  useFrame(() => {
    if (gameMode !== "walking") return; // Only move when walking

    const velocity = new THREE.Vector3(); // To calculate forward/backward movement
    const forward = new THREE.Vector3(0, 0, -1); // Forward direction
    const rotation = rotationRef.current.clone();

    // Adjust forward direction based on Player's current rotation
    forward.applyQuaternion(rotation).normalize();

    // Move forward or backward
    if (keys.w) velocity.add(forward.multiplyScalar(5)); // Forward
    if (keys.s) velocity.add(forward.multiplyScalar(-5)); // Backward

    // Apply movement to Player
    api.velocity.set(velocity.x, 0, velocity.z);

    // Handle turning
    if (keys.a) api.angularVelocity.set(0, 4, 0); // Turn left
    if (keys.d) api.angularVelocity.set(0, -4, 0); // Turn right
  });

  // Handle "E" key press
  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.key === "e" || event.key === "E") && showMessage) {
        if (!isInsideRV) {
          // Enter RV
          setIsInsideRV(true); // Set player state to outside RV
          setGameMode("driving"); // Set game mode to walking
        } else {
          // Enter the RV
          setIsInsideRV(false); // Set player state to inside RV
          setGameMode("walking"); // Set game mode to driving
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isInsideRV, setIsInsideRV, setGameMode, api, rvPosition]);

  return (
    <>
      {gameMode === "walking" && (
        <mesh ref={ref} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
      {showMessage && gameMode === "walking" && (
        <Text
          position={[
            playerPosition[0],
            playerPosition[1] + 1.5,
            playerPosition[2],
          ]}
          rotation={[pRotation[0], pRotation[1], pRotation[2]]}
          fontSize={0.2}
          color="white"
        >
          Press E to enter
        </Text>
      )}
    </>
  );
};

export default Player;

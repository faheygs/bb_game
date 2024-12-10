import React, { useEffect, useRef, useState } from "react";
import { useBox } from "@react-three/cannon";
import { useGameStore } from "../stores/gameStore";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Howl } from "howler"; // Import Howler.js
import { Text } from "@react-three/drei";

const RV = () => {
  const [ref, api] = useBox(() => ({
    position: [5, 1.5, 0], // Initial RV position
    args: [3, 3, 6], // RV dimensions
    mass: 1, // Dynamic body for movement
    linearDamping: 0.5, // Smooth linear movement
    angularDamping: 0.9, // Smooth angular movement
    angularFactor: [0, 1, 0], // Allow rotation only around Y-axis
    userData: { type: "rv" },
  }));

  const rvRotation = useGameStore((state) => state.rvRotation);
  const updateRVPosition = useGameStore((state) => state.updateRVPosition);
  const updateRVRotation = useGameStore((state) => state.updateRVRotation);
  const gameMode = useGameStore((state) => state.gameMode);
  const keys = useGameStore((state) => state.keys);
  const rvPosition = useGameStore((state) => state.rvPosition);
  const isInsideRV = useGameStore((state) => state.isInsideRV);
  const setIsInsideRV = useGameStore((state) => state.setIsInsideRV);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const setPlayerPosition = useGameStore((state) => state.updatePlayerPosition);
  const addCoin = useGameStore((state) => state.addCoin); // Add coin function

  const rotationRef = useRef(new THREE.Quaternion());

  const [isMoving, setIsMoving] = useState(false); // Track whether RV is moving
  const [showCookingMessage, setShowCookingMessage] = useState(false); // Show cooking message
  const [progress, setProgress] = useState(0); // Track cooking progress
  const [cookingDone, setCookingDone] = useState(false); // Track cooking completion
  const [cookingInProgress, setCookingInProgress] = useState(false); // Track if cooking is in progress

  // Initialize Howler.js sound for the RV engine
  const engineSound = useRef(
    new Howl({
      src: ["/sounds/engine_sound.mp3"], // Path to your sound file in the public folder
      loop: true, // Enable looping for the engine sound
      volume: 0.5, // Set initial volume
      rate: 1, // Set playback speed
    })
  );

  // Initialize Howler.js sound for the RV engine
  const cookingSound = useRef(
    new Howl({
      src: ["/sounds/cooking.mp3"], // Path to your sound file in the public folder
      loop: true, // Enable looping for the engine sound
      volume: 0.5, // Set initial volume
      rate: 1, // Set playback speed
    })
  );

  useEffect(() => {
    if (isInsideRV && isMoving && !cookingInProgress) {
      engineSound.current.play(); // Start sound when entering RV
    } else {
      engineSound.current.stop();
    }
  }, [isInsideRV, isMoving, cookingInProgress]);

  // Track RV position and update global state
  useEffect(() => {
    const unsubscribe = api.position.subscribe((position) => {
      updateRVPosition(position); // Update global RV position
    });
    return () => unsubscribe();
  }, [api.position, updateRVPosition]);

  // Track RV rotation and update global state
  useEffect(() => {
    const unsubscribe = api.quaternion.subscribe(([x, y, z, w]) => {
      rotationRef.current.set(x, y, z, w);
      const euler = new THREE.Euler().setFromQuaternion(rotationRef.current);
      updateRVRotation([euler.x, euler.y, euler.z]);
    });
    return () => unsubscribe();
  }, [api.quaternion, updateRVRotation]);

  // Handle RV movement and turning (disabled when cooking is in progress)
  useFrame(() => {
    if (gameMode !== "driving" || cookingInProgress) return; // Prevent movement if cooking is in progress

    const velocity = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1);
    const rotation = rotationRef.current.clone();

    forward.applyQuaternion(rotation).normalize();

    if (keys.w) velocity.add(forward.multiplyScalar(5)); // Forward
    if (keys.s) velocity.add(forward.multiplyScalar(-5)); // Backward

    api.velocity.set(velocity.x, 0, velocity.z);

    // Check if RV is moving
    const moving = velocity.length() > 0.1;
    setIsMoving(moving);

    if (keys.a) api.angularVelocity.set(0, 4, 0); // Turn left
    if (keys.d) api.angularVelocity.set(0, -4, 0); // Turn right
  });

  // Handle "E" key press to enter/exit the RV
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "e" || event.key === "E") {
        if (isInsideRV) {
          setIsInsideRV(false);
          setGameMode("walking");
          api.velocity.set(0, 0, 0);
          api.angularVelocity.set(0, 0, 0);
          setPlayerPosition([rvPosition[0], rvPosition[1], rvPosition[2]]);
        } else {
          setIsInsideRV(true);
          setGameMode("driving");
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isInsideRV, setIsInsideRV, setGameMode, api, rvPosition]);

  // Handle "C" key press to start cooking
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (
        (event.key === "c" || event.key === "C") &&
        isInsideRV &&
        !isMoving &&
        !cookingInProgress
      ) {
        console.log("Cooking started");
        cookingSound.current.play();
        setCookingDone(false); // Reset cooking status
        setCookingInProgress(true); // Set cooking as in progress
        setProgress(0); // Reset progress

        // Start the progress bar
        const cookingTimer = setInterval(() => {
          setProgress((prevProgress) => {
            if (prevProgress >= 100) {
              cookingSound.current.stop();
              clearInterval(cookingTimer);
              setCookingDone(true); // Cooking finished
              addCoin(); // Add one coin

              // After cooking is done, hide the message after 2 seconds
              setTimeout(() => {
                setCookingDone(false); // Hide cooking done message
                setCookingInProgress(false); // Allow new cooking attempts
              }, 2000); // Show the cooking done message for 2 seconds
            }
            return prevProgress + 2; // Update progress every 100ms (2% per tick)
          });
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isInsideRV, isMoving, addCoin, cookingInProgress]);

  // Show cooking message when the player is inside the RV and the RV is stopped
  useEffect(() => {
    if (isInsideRV && !isMoving && !cookingInProgress) {
      setShowCookingMessage(true);
    } else {
      setShowCookingMessage(false);
    }
  }, [isInsideRV, isMoving, cookingInProgress]);

  return (
    <>
      <mesh ref={ref} castShadow>
        <boxGeometry args={[3, 3, 6]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      {showCookingMessage && !cookingInProgress && (
        <Text
          position={[rvPosition[0], rvPosition[1] + 3, rvPosition[2]]}
          rotation={[rvRotation[0], rvRotation[1], rvRotation[2]]}
          fontSize={0.2}
          color="white"
        >
          Press C to start cooking
        </Text>
      )}

      {/* Progress Bar */}
      {cookingInProgress && !cookingDone && (
        <mesh
          position={[rvPosition[0], rvPosition[1] + 4, rvPosition[2]]}
          rotation={[rvRotation[0], rvRotation[1], rvRotation[2]]}
        >
          <planeGeometry args={[2, 0.2]} />
          <meshStandardMaterial color="black" />
          <mesh
            position={[-0.99 + progress / 100, 0, 0]} // Position bar according to progress
          >
            <planeGeometry args={[progress / 50, 0.2]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </mesh>
      )}

      {/* Show cooking done message */}
      {cookingDone && (
        <Text
          position={[rvPosition[0], rvPosition[1] + 4, rvPosition[2]]}
          rotation={[rvRotation[0], rvRotation[1], rvRotation[2]]}
          fontSize={0.3}
          color="white"
        >
          Cooking Done!
        </Text>
      )}
    </>
  );
};

export default RV;

import React from "react";
import { usePlane } from "@react-three/cannon";

const Environment = () => {
  const [ref] = usePlane(() => ({
    position: [0, 0, 0],
    rotation: [-Math.PI / 2, 0, 0],
    type: "Static",
    userData: { type: "ground" }, // Tagging the ground
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};

export default Environment;

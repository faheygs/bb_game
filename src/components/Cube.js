import React from "react";
import { usePhysics } from "../hooks/usePhysics";

const Cube = ({ position }) => {
  const [ref] = usePhysics({ position });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

export default Cube;

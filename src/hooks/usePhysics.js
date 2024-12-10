import { useBox } from "@react-three/cannon";

export const usePhysics = ({ position = [0, 0, 0], args = [1, 1, 1] }) => {
  const [ref, api] = useBox(() => ({
    position,
    args, // Box dimensions
    mass: 1, // Mass for physics
  }));

  return [ref, api];
};

import { useEffect } from "react";
import { useGameStore } from "../stores/gameStore";

const useInputHandler = () => {
  const setKey = useGameStore((state) => state.setKey);

  useEffect(() => {
    const handleKeyDown = (e) => setKey(e.key.toLowerCase(), true);
    const handleKeyUp = (e) => setKey(e.key.toLowerCase(), false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setKey]);
};

export default useInputHandler;

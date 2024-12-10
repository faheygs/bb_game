import { create } from "zustand";

export const useGameStore = create((set) => ({
  // Player position
  playerPosition: [0, 0, 0],
  updatePlayerPosition: (position) => set({ playerPosition: position }),

  // Player rotation (in Euler Angles: yaw, pitch, roll)
  playerRotation: [0, 0, 0], // Default rotation (no rotation)
  updatePlayerRotation: (rotation) => set({ playerRotation: rotation }),

  // RV position and rotation (RV rotation in Euler Angles)
  rvPosition: [5, 1.5, 0], // Initial RV position
  rvRotation: [0, 0, 0], // RV rotation (yaw, pitch, roll)
  updateRVPosition: (position) => set({ rvPosition: position }),
  updateRVRotation: (rotation) => set({ rvRotation: rotation }),

  // Game mode (player can be in "walking" or "driving" mode)
  gameMode: "walking", // Default mode is "walking"
  setGameMode: (mode) => set({ gameMode: mode }),

  // Track if the player is inside the RV (boolean flag)
  isInsideRV: false, // Player's state (inside RV or not)
  setIsInsideRV: (state) => set({ isInsideRV: state }),

  // Global key states (track which keys are pressed)
  keys: {},
  setKey: (key, isPressed) =>
    set((state) => ({
      keys: { ...state.keys, [key]: isPressed },
    })),

  // Coins
  coins: 0, // Initial number of coins
  addCoin: () => set((state) => ({ coins: state.coins + 1 })),
  resetCoins: () => set({ coins: 0 }),

  // Health (tracking health between 0 and 100)
  health: 100,
  updateHealth: (newHealth) =>
    set({ health: Math.max(0, Math.min(newHealth, 100)) }), // Clamps health between 0 and 100
  resetHealth: () => set({ health: 100 }),
}));

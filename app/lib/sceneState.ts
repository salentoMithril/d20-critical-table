import { create } from "zustand";

type SceneState = {
  active: number;
  count: number;
  setActive: (n: number) => void;
  setCount: (n: number) => void;

  rollResult: number | null;
  startRoll: () => void;
  resetRoll: () => void;
};

export const useSceneState = create<SceneState>((set, get) => ({
  active: 0,
  count: 6,
  setActive: (active) => set({ active }),
  setCount: (count) => set({ count }),

  rollResult: null,
  startRoll: () => {
    if (get().rollResult !== null) return;
    set({ rollResult: Math.floor(Math.random() * 20) + 1 });
  },
  resetRoll: () => set({ rollResult: null }),
}));

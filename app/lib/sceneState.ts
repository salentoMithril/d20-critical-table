import { create } from "zustand";

type SceneState = {
  active: number;
  count: number;
  setActive: (n: number) => void;
  setCount: (n: number) => void;

  rollResult: number | null;
  // Diventa true al primo lancio della sessione e resta true anche dopo il
  // reset. Lo usa la CTA per passare da "Lancia il dado e scopriamolo!" a
  // "Vuoi ritentare la fortuna?".
  hasRolledOnce: boolean;
  startRoll: () => void;
  resetRoll: () => void;
};

export const useSceneState = create<SceneState>((set, get) => ({
  active: 0,
  count: 6,
  setActive: (active) => set({ active }),
  setCount: (count) => set({ count }),

  rollResult: null,
  hasRolledOnce: false,
  startRoll: () => {
    if (get().rollResult !== null) return;
    set({
      rollResult: Math.floor(Math.random() * 20) + 1,
      hasRolledOnce: true,
    });
  },
  resetRoll: () => set({ rollResult: null }),
}));

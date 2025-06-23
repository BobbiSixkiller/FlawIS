import { create } from "zustand";

interface ScrollStore {
  scrollTriggers: Record<string, () => void>;
  setScroll: (id: string, cb: () => void) => void;
  getScroll: (id: string) => void;
  clearScroll: (id: string) => void;
}

export const useScrollStore = create<ScrollStore>((set, get) => ({
  scrollTriggers: {},
  setScroll: (id, cb) =>
    set((state) => ({ scrollTriggers: { ...state.scrollTriggers, [id]: cb } })),
  getScroll: (id) => {
    const cb = get().scrollTriggers[id];
    if (typeof cb === "function") {
      cb();
    } else {
      console.warn(`No scroll callback found for id: ${id}`);
    }
  },
  clearScroll: (id) =>
    set((state) =>
      Object.fromEntries(
        Object.entries(state.scrollTriggers).filter(([key]) => key !== id)
      )
    ),
}));

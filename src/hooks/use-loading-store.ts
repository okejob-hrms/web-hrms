import { create } from "zustand";

interface LoadingState {
  count: number;
  start: () => void;
  end: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  count: 0,
  start: () => set((state) => ({ count: state.count + 1 })),
  end: () =>
    set((state) => ({ count: Math.max(0, state.count - 1) })),
}));

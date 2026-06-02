import { create } from 'zustand';

export interface GameState {
  lives: number;
  xp: number;
  level: number;
  setLives: (n: number) => void;
  addXP: (n: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  lives: 3,
  xp: 0,
  level: 1,
  setLives: (n) => set({ lives: Math.max(0, Math.min(5, n)) }),
  addXP: (n) => set((s) => ({ xp: s.xp + n, level: Math.floor((s.xp + n) / 500) + 1 })),
}));

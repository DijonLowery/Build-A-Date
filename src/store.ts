"use client";
import { create } from "zustand";

export type WorldPhase =
  | "start"
  | "mainStreet"
  | "dinner"
  | "activity"
  | "drinks"
  | "reveal";

export type AppMode = "title" | "transition" | "instructions" | "world";

interface DateState {
  mode: AppMode;
  worldPhase: WorldPhase;
  selectedDate: string | null;
  selectedDinner: string | null;
  selectedActivity: string | null;
  selectedDrinks: string | null;
  isMoving: boolean;
  showChoice: boolean;

  setMode: (mode: AppMode) => void;
  setWorldPhase: (phase: WorldPhase) => void;
  setSelectedDate: (date: string) => void;
  setSelectedDinner: (dinner: string) => void;
  setSelectedActivity: (activity: string) => void;
  setSelectedDrinks: (drinks: string) => void;
  setIsMoving: (moving: boolean) => void;
  setShowChoice: (show: boolean) => void;
  advancePhase: () => void;
}

export const useStore = create<DateState>((set, get) => ({
  mode: "title",
  worldPhase: "start",
  selectedDate: null,
  selectedDinner: null,
  selectedActivity: null,
  selectedDrinks: null,
  isMoving: false,
  showChoice: false,

  setMode: (mode) => set({ mode }),
  setWorldPhase: (worldPhase) => set({ worldPhase }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedDinner: (dinner) => set({ selectedDinner: dinner }),
  setSelectedActivity: (activity) => set({ selectedActivity: activity }),
  setSelectedDrinks: (drinks) => set({ selectedDrinks: drinks }),
  setIsMoving: (moving) => set({ isMoving: moving }),
  setShowChoice: (show) => set({ showChoice: show }),

  advancePhase: () => {
    const { worldPhase } = get();
    const order: WorldPhase[] = [
      "start",
      "mainStreet",
      "dinner",
      "activity",
      "drinks",
      "reveal",
    ];
    const idx = order.indexOf(worldPhase);
    if (idx < order.length - 1) {
      set({
        worldPhase: order[idx + 1],
        isMoving: true,
        showChoice: false,
      });
    }
  },
}));

// Debug: expose store for testing
if (typeof window !== "undefined") {
  (window as any).__dateStore = useStore;
}

import { create } from "zustand";
import type { TransitStop } from "../lib/api/stops";

export type SearchStore = {
  destination: string;
  destinationStop: TransitStop | null;
  origin: string;
  originStop: TransitStop | null;
  selectDestination: (stop: TransitStop) => void;
  selectOrigin: (stop: TransitStop) => void;
  setDestination: (destination: string) => void;
  setOrigin: (origin: string) => void;
  swapLocations: () => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  destination: "",
  destinationStop: null,
  origin: "",
  originStop: null,
  selectDestination: (stop) => set({ destination: stop.name, destinationStop: stop }),
  selectOrigin: (stop) => set({ origin: stop.name, originStop: stop }),
  setDestination: (destination) => set((state) => ({
    destination,
    destinationStop: destination === state.destinationStop?.name ? state.destinationStop : null,
  })),
  setOrigin: (origin) => set((state) => ({
    origin,
    originStop: origin === state.originStop?.name ? state.originStop : null,
  })),
  swapLocations: () => set((state) => ({
    destination: state.origin,
    destinationStop: state.originStop,
    origin: state.destination,
    originStop: state.destinationStop,
  })),
}));

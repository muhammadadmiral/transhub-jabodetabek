import { create } from "zustand";

export type SearchStore = {
  origin: string;
  destination: string;
  isSearching: boolean;
  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  swapLocations: () => void;
  submit: () => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  origin: "",
  destination: "",
  isSearching: false,
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  swapLocations: () => set((state) => ({ origin: state.destination, destination: state.origin })),
  submit: () => {
    set({ isSearching: true });
    window.setTimeout(() => set({ isSearching: false }), 700);
  },
}));

import { create } from "zustand";

export type SearchStore = {
  origin: string;
  destination: string;
  isSearching: boolean;
  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  submit: () => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  origin: "",
  destination: "",
  isSearching: false,
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  submit: () => {
    set({ isSearching: true });
    window.setTimeout(() => set({ isSearching: false }), 700);
  },
}));

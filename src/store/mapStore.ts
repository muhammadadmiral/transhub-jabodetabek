import type { Map } from "maplibre-gl";
import { create } from "zustand";

type MapStore = {
  isThreeDimensional: boolean;
  map: Map | null;
  locateUser: () => void;
  registerMap: (map: Map | null) => void;
  toggleThreeDimensional: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

export const useMapStore = create<MapStore>((set, get) => ({
  isThreeDimensional: true,
  map: null,
  locateUser: () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      get().map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 15.5, duration: 1400 });
    });
  },
  registerMap: (map) => set({ map }),
  toggleThreeDimensional: () => {
    const isThreeDimensional = !get().isThreeDimensional;
    set({ isThreeDimensional });
    get().map?.easeTo({ pitch: isThreeDimensional ? 58 : 0, bearing: isThreeDimensional ? -18 : 0, duration: 900 });
  },
  zoomIn: () => get().map?.zoomIn({ duration: 500 }),
  zoomOut: () => get().map?.zoomOut({ duration: 500 }),
}));

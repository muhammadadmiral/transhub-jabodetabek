import type { Map } from "maplibre-gl";
import { toast } from "sonner";
import { create } from "zustand";
import { useSearchStore, type LocationKind } from "./searchStore";

type MapStore = {
  isThreeDimensional: boolean;
  map: Map | null;
  pinMode: LocationKind | null;
  beginPinPlacement: (kind: LocationKind) => void;
  cancelPinPlacement: () => void;
  focusCoordinate: (lng: number, lat: number) => void;
  locateFor: (kind: LocationKind) => void;
  locateUser: () => void;
  registerMap: (map: Map | null) => void;
  toggleThreeDimensional: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

function requestDeviceLocation(kind: LocationKind, map: Map | null) {
  if (!("geolocation" in navigator)) {
    toast.error("Perangkat tidak mendukung geolokasi");
    return;
  }
  const pending = toast.loading("Mencari lokasi kamu…");
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    toast.success("Lokasi ditemukan", { id: pending, duration: 1800 });
    useSearchStore.getState().setPin(
      kind,
      { lat: coords.latitude, lng: coords.longitude },
      "Lokasi saya",
      "device",
    );
    map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 15.5, pitch: 48, duration: 1100 });
  }, (error) => {
    toast.error(
      error.code === error.PERMISSION_DENIED
        ? "Izin lokasi ditolak — aktifkan di pengaturan browser"
        : "Lokasi tidak dapat ditemukan, coba lagi",
      { id: pending },
    );
  }, { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 });
}

export const useMapStore = create<MapStore>((set, get) => ({
  isThreeDimensional: true,
  map: null,
  pinMode: null,
  beginPinPlacement: (kind) => set({ pinMode: kind }),
  cancelPinPlacement: () => set({ pinMode: null }),
  focusCoordinate: (lng, lat) => get().map?.flyTo({ center: [lng, lat], zoom: 15.5, pitch: 50, duration: 900 }),
  locateFor: (kind) => requestDeviceLocation(kind, get().map),
  locateUser: () => requestDeviceLocation("origin", get().map),
  registerMap: (map) => set({ map }),
  toggleThreeDimensional: () => {
    const isThreeDimensional = !get().isThreeDimensional;
    set({ isThreeDimensional });
    get().map?.easeTo({ pitch: isThreeDimensional ? 58 : 0, bearing: isThreeDimensional ? -18 : 0, duration: 900 });
  },
  zoomIn: () => get().map?.zoomIn({ duration: 500 }),
  zoomOut: () => get().map?.zoomOut({ duration: 500 }),
}));

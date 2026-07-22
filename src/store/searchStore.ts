import { create } from "zustand";
import type { PlaceResult } from "../lib/api/geocode";
import type { NearbyStop } from "../lib/api/nearby";
import type { TransitStop } from "../lib/api/stops";

export type LocationKind = "origin" | "destination";
export type Coordinate = { lat: number; lng: number };

export type LocationSelection =
  | { kind: "empty" }
  | { kind: "transit-stop"; stop: TransitStop }
  | {
      kind: "pin";
      coordinate: Coordinate;
      label: string;
      selectedStop: NearbyStop | null;
      source: "device" | "geocoder" | "map";
    };

type SearchStore = {
  destinationQuery: string;
  destinationSelection: LocationSelection;
  originQuery: string;
  originSelection: LocationSelection;
  selectNearbyStop: (kind: LocationKind, stop: NearbyStop) => void;
  selectPlace: (kind: LocationKind, place: PlaceResult) => void;
  selectStop: (kind: LocationKind, stop: TransitStop) => void;
  setPin: (kind: LocationKind, coordinate: Coordinate, label?: string, source?: "device" | "geocoder" | "map") => void;
  updatePinLabel: (kind: LocationKind, coordinate: Coordinate, label: string) => void;
  setQuery: (kind: LocationKind, query: string) => void;
  swapLocations: () => void;
};

const emptySelection: LocationSelection = { kind: "empty" };

export const useSearchStore = create<SearchStore>((set) => ({
  destinationQuery: "",
  destinationSelection: emptySelection,
  originQuery: "",
  originSelection: emptySelection,
  selectNearbyStop: (kind, stop) => set((state) => ({
    [`${kind}Selection`]: state[`${kind}Selection`].kind === "pin"
      ? { ...state[`${kind}Selection`], selectedStop: stop }
      : state[`${kind}Selection`],
  })),
  selectPlace: (kind, place) => set({
    [`${kind}Query`]: place.label,
    [`${kind}Selection`]: {
      coordinate: { lat: place.lat, lng: place.lng },
      kind: "pin",
      label: place.label,
      selectedStop: null,
      source: "geocoder",
    },
  }),
  selectStop: (kind, stop) => set({
    [`${kind}Query`]: stop.name,
    [`${kind}Selection`]: { kind: "transit-stop", stop },
  }),
  setPin: (kind, coordinate, label = "Lokasi pilihan", source = "map") => set((state) => {
    const current = state[`${kind}Selection`];
    return {
      [`${kind}Query`]: label,
      [`${kind}Selection`]: {
        coordinate,
        kind: "pin",
        label,
        selectedStop: current.kind === "pin" && current.coordinate.lat === coordinate.lat && current.coordinate.lng === coordinate.lng
          ? current.selectedStop
          : null,
        source,
      },
    };
  }),
  setQuery: (kind, query) => set((state) => {
    const selection = state[`${kind}Selection`];
    const selectedLabel = selection.kind === "transit-stop" ? selection.stop.name : selection.kind === "pin" ? selection.label : "";
    return {
      [`${kind}Query`]: query,
      [`${kind}Selection`]: query === selectedLabel ? selection : emptySelection,
    };
  }),
  updatePinLabel: (kind, coordinate, label) => set((state) => {
    const current = state[`${kind}Selection`];
    if (
      current.kind !== "pin"
      || current.coordinate.lat !== coordinate.lat
      || current.coordinate.lng !== coordinate.lng
    ) return state;
    return {
      [`${kind}Query`]: label,
      [`${kind}Selection`]: { ...current, label },
    };
  }),
  swapLocations: () => set((state) => ({
    destinationQuery: state.originQuery,
    destinationSelection: state.originSelection,
    originQuery: state.destinationQuery,
    originSelection: state.destinationSelection,
  })),
}));

export function getResolvedStop(selection: LocationSelection) {
  if (selection.kind === "transit-stop") return selection.stop;
  if (selection.kind === "pin") return selection.selectedStop;
  return null;
}

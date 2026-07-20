import { useQuery } from "@tanstack/react-query";
import { getNearbyStops, type NearbyStopPurpose } from "../../../lib/api/nearby";
import { queryKeys } from "../../../lib/api/queryKeys";
import type { LocationSelection } from "../../../store/searchStore";

export function useNearbyStops(selection: LocationSelection, purpose: NearbyStopPurpose) {
  const input = selection.kind === "pin" ? {
    lat: Number(selection.coordinate.lat.toFixed(5)),
    lng: Number(selection.coordinate.lng.toFixed(5)),
    purpose,
    radiusMeters: 1000,
  } : null;

  return useQuery({
    enabled: input !== null,
    gcTime: 30 * 60_000,
    queryFn: ({ signal }) => {
      if (!input) throw new Error("Koordinat belum dipilih");
      return getNearbyStops(input, signal);
    },
    queryKey: input ? queryKeys.nearby(input) : ["stops", "nearby", purpose, "idle"],
    staleTime: 5 * 60_000,
  });
}

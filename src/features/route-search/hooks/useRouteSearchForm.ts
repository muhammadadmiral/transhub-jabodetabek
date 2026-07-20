import { useEffect } from "react";
import type { PlaceResult } from "../../../lib/api/geocode";
import type { RouteSearchInput } from "../../../lib/api/routes";
import { useMapStore } from "../../../store/mapStore";
import { getResolvedStop, useSearchStore, type LocationKind, type LocationSelection } from "../../../store/searchStore";
import { useLocationAutocomplete } from "./useLocationAutocomplete";
import { useNearbyStops } from "./useNearbyStops";

function useAutoResolveNearby(kind: LocationKind, selection: LocationSelection) {
  const query = useNearbyStops(selection, kind);
  const selectNearbyStop = useSearchStore((state) => state.selectNearbyStop);

  useEffect(() => {
    if (selection.kind !== "pin" || selection.selectedStop || !query.data?.length) return;
    const eligible = query.data.find((stop) => kind === "origin" ? stop.canBoard : stop.canAlight);
    selectNearbyStop(kind, eligible || query.data[0]);
  }, [kind, query.data, selectNearbyStop, selection]);

  return query;
}

export function useRouteSearchForm() {
  const destinationQuery = useSearchStore((state) => state.destinationQuery);
  const destinationSelection = useSearchStore((state) => state.destinationSelection);
  const originQuery = useSearchStore((state) => state.originQuery);
  const originSelection = useSearchStore((state) => state.originSelection);
  const selectPlace = useSearchStore((state) => state.selectPlace);
  const selectNearbyStop = useSearchStore((state) => state.selectNearbyStop);
  const selectStop = useSearchStore((state) => state.selectStop);
  const setQuery = useSearchStore((state) => state.setQuery);
  const swapLocations = useSearchStore((state) => state.swapLocations);
  const beginPinPlacement = useMapStore((state) => state.beginPinPlacement);
  const focusCoordinate = useMapStore((state) => state.focusCoordinate);
  const locateFor = useMapStore((state) => state.locateFor);
  const originNearby = useAutoResolveNearby("origin", originSelection);
  const destinationNearby = useAutoResolveNearby("destination", destinationSelection);

  function handlePlaceSelect(kind: LocationKind, place: PlaceResult) {
    selectPlace(kind, place);
    focusCoordinate(place.lng, place.lat);
  }

  const originField = useLocationAutocomplete({
    nearbyStops: originNearby.data ?? [],
    onNearbySelect: (stop) => selectNearbyStop("origin", stop),
    onPickOnMap: () => beginPinPlacement("origin"),
    onPlaceSelect: (place) => handlePlaceSelect("origin", place),
    onQueryChange: (value) => setQuery("origin", value),
    onStopSelect: (stop) => selectStop("origin", stop),
    onUseDevice: () => locateFor("origin"),
    query: originQuery,
    selection: originSelection,
  });
  const destinationField = useLocationAutocomplete({
    nearbyStops: destinationNearby.data ?? [],
    onNearbySelect: (stop) => selectNearbyStop("destination", stop),
    onPickOnMap: () => beginPinPlacement("destination"),
    onPlaceSelect: (place) => handlePlaceSelect("destination", place),
    onQueryChange: (value) => setQuery("destination", value),
    onStopSelect: (stop) => selectStop("destination", stop),
    onUseDevice: () => locateFor("destination"),
    query: destinationQuery,
    selection: destinationSelection,
  });

  const originStop = getResolvedStop(originSelection);
  const destinationStop = getResolvedStop(destinationSelection);
  const canSubmit = originSelection.kind !== "empty"
    && destinationSelection.kind !== "empty"
    && !(originStop && destinationStop && originStop.id === destinationStop.id);

  function createSearchInput(): RouteSearchInput | null {
    if (!canSubmit) return null;
    return {
      ...(destinationSelection.kind === "pin"
        ? {
            destinationLat: destinationSelection.coordinate.lat,
            destinationLng: destinationSelection.coordinate.lng,
          }
        : { destinationStopId: destinationSelection.stop.id }),
      maxTransfers: 3,
      ...(originSelection.kind === "pin"
        ? {
            originLat: originSelection.coordinate.lat,
            originLng: originSelection.coordinate.lng,
          }
        : { originStopId: originSelection.stop.id }),
      paymentProfile: "standard",
    };
  }

  return {
    canSubmit,
    createSearchInput,
    destinationField,
    destinationKey: destinationSelection.kind === "pin"
      ? `pin:${destinationSelection.coordinate.lat},${destinationSelection.coordinate.lng}`
      : destinationSelection.kind === "transit-stop" ? destinationSelection.stop.id : "empty",
    onSwap: swapLocations,
    originField,
    originKey: originSelection.kind === "pin"
      ? `pin:${originSelection.coordinate.lat},${originSelection.coordinate.lng}`
      : originSelection.kind === "transit-stop" ? originSelection.stop.id : "empty",
  };
}

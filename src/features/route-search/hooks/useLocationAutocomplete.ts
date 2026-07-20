import { useEffect, useId, useState, type KeyboardEvent } from "react";
import type { PlaceResult } from "../../../lib/api/geocode";
import type { NearbyStop } from "../../../lib/api/nearby";
import type { TransitStop } from "../../../lib/api/stops";
import type { LocationSelection } from "../../../store/searchStore";
import { usePlaceSearch } from "./usePlaceSearch";
import { useStopSearch } from "./useStopSearch";

type UseLocationAutocompleteOptions = {
  nearbyStops: NearbyStop[];
  onPickOnMap: () => void;
  onNearbySelect: (stop: NearbyStop) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  onQueryChange: (value: string) => void;
  onStopSelect: (stop: TransitStop) => void;
  onUseDevice: () => void;
  query: string;
  selection: LocationSelection;
};

export function useLocationAutocomplete(options: UseLocationAutocompleteOptions) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [placeSearchQuery, setPlaceSearchQuery] = useState<string | null>(null);
  const stopQuery = useStopSearch(options.query);
  const placeQuery = usePlaceSearch(placeSearchQuery);
  const stops = stopQuery.data ?? [];
  const places = placeQuery.data ?? [];

  useEffect(() => setActiveIndex(-1), [stopQuery.data]);

  function selectStop(stop: TransitStop) {
    options.onStopSelect(stop);
    setIsOpen(false);
    setActiveIndex(-1);
    setPlaceSearchQuery(null);
  }

  function selectPlace(place: PlaceResult) {
    options.onPlaceSelect(place);
    setIsOpen(false);
    setPlaceSearchQuery(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => stops.length === 0 ? -1 : (current + direction + stops.length) % stops.length);
      return;
    }
    if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      selectStop(stops[activeIndex]);
      return;
    }
    if (event.key === "Enter" && options.query.trim().length >= 3) {
      event.preventDefault();
      setPlaceSearchQuery(options.query);
      setIsOpen(true);
    }
  }

  const resolvedStop = options.selection.kind === "transit-stop"
    ? options.selection.stop
    : options.selection.kind === "pin"
      ? options.selection.selectedStop
      : null;

  return {
    activeIndex,
    activeOptionId: activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined,
    inputId,
    isLoadingPlaces: placeQuery.isFetching,
    isLoadingStops: stopQuery.isFetching,
    isOpen: isOpen && options.selection.kind === "empty",
    listboxId,
    nearbyStops: options.nearbyStops,
    onChange(value: string) {
      options.onQueryChange(value);
      setPlaceSearchQuery(null);
      setIsOpen(true);
    },
    onClose: () => setIsOpen(false),
    onFocus: () => setIsOpen(true),
    onKeyDown: handleKeyDown,
    onNearbySelect: options.onNearbySelect,
    onPickOnMap: options.onPickOnMap,
    onPlaceSelect: selectPlace,
    onRetryPlaces: () => placeQuery.refetch(),
    onRetryStops: () => stopQuery.refetch(),
    onSearchPlaces: () => setPlaceSearchQuery(options.query),
    onStopSelect: selectStop,
    onUseDevice: options.onUseDevice,
    placeError: placeQuery.isError,
    places,
    query: options.query,
    resolvedStop,
    selection: options.selection,
    stopError: stopQuery.isError,
    stops,
  };
}

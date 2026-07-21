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

export type AutocompleteOption =
  | { kind: "place"; place: PlaceResult }
  | { kind: "stop"; stop: TransitStop };

const MAX_PLACES = 5;
const MAX_STOPS = 4;

export function useLocationAutocomplete(options: UseLocationAutocompleteOptions) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const stopQuery = useStopSearch(options.query);
  const placeQuery = usePlaceSearch(options.query);
  const stops = (stopQuery.data ?? []).slice(0, MAX_STOPS);
  const places = (placeQuery.data ?? []).slice(0, MAX_PLACES);

  // Prioritas: lokasi/tempat (maps) dulu, baru halte & stasiun.
  const flatOptions: AutocompleteOption[] = [
    ...places.map((place) => ({ kind: "place", place }) as const),
    ...stops.map((stop) => ({ kind: "stop", stop }) as const),
  ];

  useEffect(() => setActiveIndex(-1), [stopQuery.data, placeQuery.data]);

  function selectStop(stop: TransitStop) {
    options.onStopSelect(stop);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectPlace(place: PlaceResult) {
    options.onPlaceSelect(place);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectOption(option: AutocompleteOption) {
    if (option.kind === "place") selectPlace(option.place);
    else selectStop(option.stop);
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
      setActiveIndex((current) => flatOptions.length === 0 ? -1 : (current + direction + flatOptions.length) % flatOptions.length);
      return;
    }
    if (event.key === "Enter" && isOpen && activeIndex >= 0 && flatOptions[activeIndex]) {
      event.preventDefault();
      selectOption(flatOptions[activeIndex]);
      return;
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
    flatOptions,
    inputId,
    isLoadingPlaces: placeQuery.isFetching,
    isLoadingStops: stopQuery.isFetching,
    isOpen: isOpen && options.selection.kind === "empty",
    listboxId,
    nearbyStops: options.nearbyStops,
    onChange(value: string) {
      options.onQueryChange(value);
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

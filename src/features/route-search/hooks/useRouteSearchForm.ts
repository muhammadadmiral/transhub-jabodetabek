import { useSearchStore } from "../../../store/searchStore";

export function useRouteSearchForm() {
  const origin = useSearchStore((state) => state.origin);
  const destination = useSearchStore((state) => state.destination);
  const isSearching = useSearchStore((state) => state.isSearching);
  const setOrigin = useSearchStore((state) => state.setOrigin);
  const setDestination = useSearchStore((state) => state.setDestination);
  const swapLocations = useSearchStore((state) => state.swapLocations);
  const submit = useSearchStore((state) => state.submit);

  return {
    canSubmit: origin.trim().length > 0 && destination.trim().length > 0,
    destination,
    isSearching,
    origin,
    onDestinationChange: setDestination,
    onOriginChange: setOrigin,
    onSubmit: submit,
    onSwap: swapLocations,
  };
}

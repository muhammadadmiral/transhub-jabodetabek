import type { RouteSearchInput } from "../../../lib/api/routes";
import { useSearchStore } from "../../../store/searchStore";
import { useStopAutocomplete } from "./useStopAutocomplete";

export function useRouteSearchForm() {
  const destination = useSearchStore((state) => state.destination);
  const destinationStop = useSearchStore((state) => state.destinationStop);
  const origin = useSearchStore((state) => state.origin);
  const originStop = useSearchStore((state) => state.originStop);
  const selectDestination = useSearchStore((state) => state.selectDestination);
  const selectOrigin = useSearchStore((state) => state.selectOrigin);
  const setDestination = useSearchStore((state) => state.setDestination);
  const setOrigin = useSearchStore((state) => state.setOrigin);
  const swapLocations = useSearchStore((state) => state.swapLocations);

  const originField = useStopAutocomplete({
    onQueryChange: setOrigin,
    onSelect: selectOrigin,
    query: origin,
    selectedStop: originStop,
  });
  const destinationField = useStopAutocomplete({
    onQueryChange: setDestination,
    onSelect: selectDestination,
    query: destination,
    selectedStop: destinationStop,
  });

  const canSubmit = Boolean(
    originStop && destinationStop && originStop.id !== destinationStop.id,
  );

  function createSearchInput(): RouteSearchInput | null {
    if (!canSubmit || !originStop || !destinationStop) return null;
    return {
      destinationStopId: destinationStop.id,
      maxTransfers: 3,
      originStopId: originStop.id,
      paymentProfile: "standard",
    };
  }

  return {
    canSubmit,
    createSearchInput,
    destinationField,
    onSwap: swapLocations,
    originField,
  };
}

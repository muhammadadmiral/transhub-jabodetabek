import { useEffect } from "react";
import { useJourney } from "../JourneyContext";
import { useRouteSearchForm } from "../hooks/useRouteSearchForm";
import { createRouteCards } from "../lib/routeViewModel";
import { SearchSheet } from "./SearchSheet";

export function RouteSearch() {
  const form = useRouteSearchForm();
  const journey = useJourney();

  useEffect(() => {
    journey.clearJourney();
  }, [form.originField.resolvedStop?.id, form.destinationField.resolvedStop?.id]);

  function handleSubmit() {
    const input = form.createSearchInput();
    if (!input) return;
    journey.search(input);
  }

  return (
    <SearchSheet
      canSubmit={form.canSubmit}
      destinationField={form.destinationField}
      isSearching={journey.routeQuery.isFetching}
      onSelectCriteria={journey.selectCriteria}
      onSubmit={handleSubmit}
      onSwap={form.onSwap}
      originField={form.originField}
      routeCards={createRouteCards(journey.routeQuery.data)}
      routeData={journey.routeQuery.data}
      routeError={journey.routeQuery.error}
      selectedCriteria={journey.selectedCriteria}
    />
  );
}

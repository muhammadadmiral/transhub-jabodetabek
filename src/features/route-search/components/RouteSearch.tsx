import { useEffect, useState } from "react";
import type { RouteSearchInput } from "../../../lib/api/routes";
import { useRouteSearchForm } from "../hooks/useRouteSearchForm";
import { useRouteSearch } from "../hooks/useRouteSearch";
import { createRouteCards } from "../lib/routeViewModel";
import { SearchPanel } from "./SearchPanel";

export function RouteSearch() {
  const form = useRouteSearchForm();
  const [searchInput, setSearchInput] = useState<RouteSearchInput | null>(null);
  const routeQuery = useRouteSearch(searchInput);

  useEffect(() => {
    setSearchInput(null);
  }, [form.originField.selectedStop?.id, form.destinationField.selectedStop?.id]);

  function handleSubmit() {
    const input = form.createSearchInput();
    if (!input) return;

    const isSameRequest = JSON.stringify(input) === JSON.stringify(searchInput);
    if (isSameRequest && routeQuery.isError) {
      routeQuery.refetch();
      return;
    }
    setSearchInput(input);
  }

  return (
    <SearchPanel
      canSubmit={form.canSubmit}
      destinationField={form.destinationField}
      isSearching={routeQuery.isFetching}
      onSubmit={handleSubmit}
      onSwap={form.onSwap}
      originField={form.originField}
      routeData={routeQuery.data}
      routeCards={createRouteCards(routeQuery.data)}
      routeError={routeQuery.error}
    />
  );
}

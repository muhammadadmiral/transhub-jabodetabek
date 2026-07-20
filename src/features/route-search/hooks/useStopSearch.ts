import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { queryKeys } from "../../../lib/api/queryKeys";
import { searchStops } from "../../../lib/api/stops";
import { normalizeSearchQuery } from "../../../lib/normalizeSearchQuery";

export function useStopSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, 300);
  const normalizedQuery = normalizeSearchQuery(debouncedQuery);

  return useQuery({
    enabled: normalizedQuery.length >= 2,
    gcTime: 30 * 60_000,
    queryFn: ({ signal }) => searchStops(normalizedQuery, signal),
    queryKey: queryKeys.stops.search(normalizedQuery),
    staleTime: 10 * 60_000,
  });
}

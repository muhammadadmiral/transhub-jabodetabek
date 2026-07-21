import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { searchPlaces } from "../../../lib/api/geocode";
import { queryKeys } from "../../../lib/api/queryKeys";
import { normalizeSearchQuery } from "../../../lib/normalizeSearchQuery";

export function usePlaceSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, 600);
  const normalizedQuery = normalizeSearchQuery(debouncedQuery);
  return useQuery({
    enabled: normalizedQuery.length >= 3,
    gcTime: 24 * 60 * 60_000,
    queryFn: ({ signal }) => searchPlaces(normalizedQuery, signal),
    queryKey: queryKeys.geocode.search(normalizedQuery),
    staleTime: 24 * 60 * 60_000,
  });
}

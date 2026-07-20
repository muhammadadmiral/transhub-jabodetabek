import { useQuery } from "@tanstack/react-query";
import { searchPlaces } from "../../../lib/api/geocode";
import { queryKeys } from "../../../lib/api/queryKeys";
import { normalizeSearchQuery } from "../../../lib/normalizeSearchQuery";

export function usePlaceSearch(query: string | null) {
  const normalizedQuery = normalizeSearchQuery(query || "");
  return useQuery({
    enabled: normalizedQuery.length >= 3,
    gcTime: 24 * 60 * 60_000,
    queryFn: ({ signal }) => searchPlaces(normalizedQuery, signal),
    queryKey: queryKeys.geocode.search(normalizedQuery),
    staleTime: 24 * 60 * 60_000,
  });
}

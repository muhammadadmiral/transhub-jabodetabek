import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/api/queryKeys";
import { searchRoutes, type RouteSearchInput } from "../../../lib/api/routes";

export function useRouteSearch(input: RouteSearchInput | null) {
  return useQuery({
    enabled: input !== null,
    gcTime: 30 * 60_000,
    queryFn: ({ signal }) => {
      if (!input) throw new Error("Route search input belum tersedia");
      return searchRoutes(input, signal);
    },
    queryKey: input ? queryKeys.routes.search(input) : queryKeys.routes.all,
    staleTime: 3 * 60_000,
  });
}

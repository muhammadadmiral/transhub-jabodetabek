import type { RouteSearchInput } from "./routes";
import type { NearbyStopsInput } from "./nearby";

export const queryKeys = {
  geocode: {
    search: (query: string) => ["geocode", "search", query] as const,
  },
  nearby: (input: NearbyStopsInput) => ["stops", "nearby", input] as const,
  routes: {
    all: ["routes"] as const,
    search: (input: RouteSearchInput) => ["routes", "search", input] as const,
  },
  stops: {
    all: ["stops"] as const,
    search: (query: string) => ["stops", "search", query] as const,
  },
};

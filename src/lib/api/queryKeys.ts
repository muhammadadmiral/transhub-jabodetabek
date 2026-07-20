import type { RouteSearchInput } from "./routes";

export const queryKeys = {
  routes: {
    all: ["routes"] as const,
    search: (input: RouteSearchInput) => ["routes", "search", input] as const,
  },
  stops: {
    all: ["stops"] as const,
    search: (query: string) => ["stops", "search", query] as const,
  },
};

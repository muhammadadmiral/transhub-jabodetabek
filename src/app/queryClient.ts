import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../lib/api/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry(failureCount, error) {
        if (error instanceof ApiError && [404, 422].includes(error.status)) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60_000,
    },
  },
});

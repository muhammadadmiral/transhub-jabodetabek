import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { RouteOption, RouteSearchInput } from "../../lib/api/routes";
import { useRouteSearch } from "./hooks/useRouteSearch";

type JourneyContextValue = {
  clearJourney: () => void;
  routeQuery: ReturnType<typeof useRouteSearch>;
  search: (input: RouteSearchInput) => void;
  selectedCriteria: string | null;
  selectedOption: RouteOption | null;
  selectCriteria: (criteria: string) => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<RouteSearchInput | null>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<string | null>(null);
  const routeQuery = useRouteSearch(input);
  const selectedOption = useMemo(() => {
    const options = routeQuery.data?.options ?? [];
    return options.find((option) => option.criteria === selectedCriteria)
      ?? options.find((option) => option.criteria === "fastest")
      ?? options[0]
      ?? null;
  }, [routeQuery.data, selectedCriteria]);

  const value = useMemo<JourneyContextValue>(() => ({
    clearJourney() {
      setInput(null);
      setSelectedCriteria(null);
    },
    routeQuery,
    search(nextInput) {
      setInput(nextInput);
      setSelectedCriteria("fastest");
    },
    selectedCriteria: selectedOption?.criteria ?? selectedCriteria,
    selectedOption,
    selectCriteria: setSelectedCriteria,
  }), [routeQuery, selectedCriteria, selectedOption]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) throw new Error("useJourney harus digunakan di dalam JourneyProvider");
  return context;
}

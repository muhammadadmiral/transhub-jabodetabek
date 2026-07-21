import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { RouteOption, RouteSearchInput } from "../../lib/api/routes";
import { useRouteSearch } from "./hooks/useRouteSearch";

type JourneyContextValue = {
  clearJourney: () => void;
  hoveredCriteria: string | null;
  options: RouteOption[];
  routeQuery: ReturnType<typeof useRouteSearch>;
  search: (input: RouteSearchInput) => void;
  selectedCriteria: string | null;
  selectedOption: RouteOption | null;
  selectCriteria: (criteria: string) => void;
  setHoveredCriteria: (criteria: string | null) => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<RouteSearchInput | null>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<string | null>(null);
  const [hoveredCriteria, setHoveredCriteria] = useState<string | null>(null);
  const routeQuery = useRouteSearch(input);
  const options = useMemo(() => {
    const list = routeQuery.data?.options ?? [];
    // Buang duplikat: jika tercepat & termurah jalurnya sama, cukup satu garis.
    const signatures = new Set<string>();
    return list.filter((option) => {
      const signature = option.segments.map((segment) => segment.id).join("|");
      if (signatures.has(signature)) return false;
      signatures.add(signature);
      return true;
    });
  }, [routeQuery.data]);
  const selectedOption = useMemo(() => {
    return options.find((option) => option.criteria === selectedCriteria)
      ?? options.find((option) => option.criteria === "fastest")
      ?? options[0]
      ?? null;
  }, [options, selectedCriteria]);

  const value = useMemo<JourneyContextValue>(() => ({
    clearJourney() {
      setInput(null);
      setSelectedCriteria(null);
      setHoveredCriteria(null);
    },
    hoveredCriteria,
    options,
    routeQuery,
    search(nextInput) {
      setInput(nextInput);
      setSelectedCriteria("fastest");
    },
    selectedCriteria: selectedOption?.criteria ?? selectedCriteria,
    selectedOption,
    selectCriteria: setSelectedCriteria,
    setHoveredCriteria,
  }), [hoveredCriteria, options, routeQuery, selectedCriteria, selectedOption]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) throw new Error("useJourney harus digunakan di dalam JourneyProvider");
  return context;
}

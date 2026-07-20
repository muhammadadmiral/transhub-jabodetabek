import { useEffect, useId, useState, type KeyboardEvent } from "react";
import type { TransitStop } from "../../../lib/api/stops";
import { useStopSearch } from "./useStopSearch";

type UseStopAutocompleteOptions = {
  query: string;
  selectedStop: TransitStop | null;
  onQueryChange: (value: string) => void;
  onSelect: (stop: TransitStop) => void;
};

export function useStopAutocomplete({ query, selectedStop, onQueryChange, onSelect }: UseStopAutocompleteOptions) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const stopQuery = useStopSearch(query);
  const stops = stopQuery.data ?? [];

  useEffect(() => setActiveIndex(-1), [stopQuery.data]);

  function selectStop(stop: TransitStop) {
    onSelect(stop);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        if (stops.length === 0) return -1;
        return (current + direction + stops.length) % stops.length;
      });
      return;
    }

    if (event.key === "Enter" && isOpen && activeIndex >= 0) {
      event.preventDefault();
      selectStop(stops[activeIndex]);
    }
  }

  return {
    activeIndex,
    activeOptionId: activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined,
    inputId,
    isError: stopQuery.isError,
    isLoading: stopQuery.isFetching,
    isOpen: isOpen && query.trim().length >= 2 && !selectedStop,
    listboxId,
    onChange(value: string) {
      onQueryChange(value);
      setIsOpen(true);
    },
    onClose: () => setIsOpen(false),
    onFocus: () => setIsOpen(true),
    onKeyDown: handleKeyDown,
    onRetry: () => stopQuery.refetch(),
    onSelect: selectStop,
    query,
    selectedStop,
    stops,
  };
}

"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface SearchFilters {
  query: string;
  categories: Set<string>;
  regions: Set<string>;
  levels: Set<string>;
}

interface FiltersContextValue {
  filters: SearchFilters;
  setFilters: (f: SearchFilters) => void;
  updateQuery: (q: string) => void;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<SearchFilters>({
    query: "", categories: new Set(), regions: new Set(), levels: new Set(),
  });

  const setFilters = useCallback((f: SearchFilters) => setFiltersState(f), []);
  const updateQuery = useCallback((q: string) => {
    setFiltersState(f => ({ ...f, query: q }));
  }, []);

  return (
    <FiltersContext value={{ filters, setFilters, updateQuery }}>
      {children}
    </FiltersContext>
  );
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used within FiltersProvider");
  return ctx;
}

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { FilterState, DateRangePreset } from '../types';

interface FilterContextValue extends FilterState {
  setDateRange: (range: DateRangePreset) => void;
  toggleLocation: (locationId: string) => void;
  clearLocations: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d');

  const toggleLocation = (locationId: string) => {
    setSelectedLocations(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const clearLocations = () => setSelectedLocations([]);

  return (
    <FilterContext.Provider value={{
      selectedLocations,
      dateRange,
      setDateRange,
      toggleLocation,
      clearLocations,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

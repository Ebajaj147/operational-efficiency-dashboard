import { Calendar, MapPin, X } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { locations } from '../../data/mockData';
import type { DateRangePreset } from '../../types';

const dateRangeOptions: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

export function FilterBar() {
  const { selectedLocations, dateRange, setDateRange, toggleLocation, clearLocations } = useFilters();

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {dateRangeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  dateRange === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-slate-400" />
          <div className="flex gap-1.5 flex-wrap">
            {locations.map(loc => (
              <button
                key={loc.id}
                onClick={() => toggleLocation(loc.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedLocations.includes(loc.id)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200'
                }`}
              >
                {loc.name}
              </button>
            ))}
            {selectedLocations.length > 0 && (
              <button
                onClick={clearLocations}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Star, MapPin } from 'lucide-react';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { useFilters } from '../context/FilterContext';
import { getLocationMetrics } from '../data/mockData';
import { formatNumber, formatPercent, formatMinutes, formatDays } from '../utils/formatters';
import type { LocationMetrics } from '../types';

type SortField = 'name' | 'score' | 'invoiceCount' | 'touchlessRate' | 'editRate' | 'manualMinutesPerInvoice';
type SortDir = 'asc' | 'desc';

export function Locations() {
  const { selectedLocations, dateRange } = useFilters();
  const allLocations = getLocationMetrics(selectedLocations, dateRange);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  const filteredLocations = allLocations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.region.toLowerCase().includes(search.toLowerCase())
  );

  const sortedLocations = [...filteredLocations].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const cmp = typeof aVal === 'string' ? (aVal as string).localeCompare(bVal as string) : (aVal as number) - (bVal as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortDir === 'asc' ? <ArrowUp size={14} className="text-blue-500" /> : <ArrowDown size={14} className="text-blue-500" />;
  };

  const chartData = [...allLocations]
    .sort((a, b) => b.score - a.score)
    .map(l => ({ name: l.name, score: l.score }));

  const bestLocation = [...allLocations].sort((a, b) => b.score - a.score)[0];
  const avgScore = allLocations.reduce((sum, l) => sum + l.score, 0) / allLocations.length;
  const totalInvoices = allLocations.reduce((sum, l) => sum + l.invoiceCount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-slate-400" />
            <p className="text-xs text-slate-500">Locations</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{allLocations.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-2">Avg Score</p>
          <p className="text-xl font-bold text-slate-900">{avgScore.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-amber-400" />
            <p className="text-xs text-slate-500">Best Performer</p>
          </div>
          <p className="text-xl font-bold text-emerald-600">{bestLocation?.name}</p>
          <p className="text-xs text-slate-500">Score: {bestLocation?.score.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-2">Total Invoices</p>
          <p className="text-xl font-bold text-slate-900">{formatNumber(totalInvoices)}</p>
        </div>
      </div>

      <PerformanceChart data={chartData} title="Location Scores" height={280} />

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search locations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {([
                  ['name', 'Location'],
                  ['score', 'Score'],
                  ['invoiceCount', 'Invoices'],
                  ['touchlessRate', 'Touchless Rate'],
                  ['editRate', 'Edit Rate'],
                  ['manualMinutesPerInvoice', 'Avg Manual Time'],
                ] as [SortField, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    onClick={() => toggleSort(field)}
                    className="text-left py-2 px-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon field={field} />
                    </span>
                  </th>
                ))}
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Avg Processing</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Staff</th>
              </tr>
            </thead>
            <tbody>
              {sortedLocations.map((location: LocationMetrics, index: number) => (
                <tr
                  key={location.id}
                  className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    index === 0 && sortField === 'score' && sortDir === 'desc' ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {index === 0 && sortField === 'score' && sortDir === 'desc' && (
                        <Star size={14} className="text-amber-400" />
                      )}
                      <span className="font-medium text-slate-900">{location.name}</span>
                      <span className="text-xs text-slate-400">{location.region}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3"><ScoreBadge score={location.score} /></td>
                  <td className="py-3 px-3 text-slate-700">{formatNumber(location.invoiceCount)}</td>
                  <td className="py-3 px-3 text-slate-700">{formatPercent(location.touchlessRate)}</td>
                  <td className="py-3 px-3 text-slate-700">{formatPercent(location.editRate)}</td>
                  <td className="py-3 px-3 text-slate-700">{formatMinutes(location.manualMinutesPerInvoice)}</td>
                  <td className="py-3 px-3 text-slate-700">{formatDays(location.avgProcessingHours)}</td>
                  <td className="py-3 px-3 text-slate-700">{location.staffCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

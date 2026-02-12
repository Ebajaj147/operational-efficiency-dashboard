import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, AlertCircle, Clock, TrendingDown, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { useFilters } from '../context/FilterContext';
import { getVendorMetrics, getVendorEditTimes } from '../data/mockData';
import { formatNumber, formatPercent, formatCurrency, formatMinutes, formatHoursPerWeek } from '../utils/formatters';

type SortField = 'name' | 'score' | 'invoiceCount' | 'totalSpend' | 'poMatchRate' | 'errorRate' | 'weeklyManualHours';
type SortDir = 'asc' | 'desc';

export function Vendors() {
  const { selectedLocations, dateRange } = useFilters();
  const allVendors = getVendorMetrics(selectedLocations, dateRange);
  const vendorEditTimes = getVendorEditTimes(dateRange);

  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');

  // Merge vendor metrics with edit times
  const vendorsWithTimes = allVendors.map(vendor => {
    const timeData = vendorEditTimes.find(c => c.vendorId === vendor.id);
    return {
      ...vendor,
      editCount: timeData?.editCount || 0,
      avgMinutesPerEdit: timeData?.avgMinutesPerEdit || 0,
      totalManualMinutes: timeData?.totalManualMinutes || 0,
      weeklyManualHours: timeData?.weeklyManualHours || 0,
      potentialTimeSavingsMinutes: timeData?.potentialTimeSavingsMinutes || 0,
    };
  });

  const filteredVendors = vendorsWithTimes.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedVendors = [...filteredVendors].sort((a, b) => {
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

  const chartData = [...allVendors]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(v => ({ name: v.name, score: v.score }));

  const problematicVendors = vendorsWithTimes.filter(v => v.score < 70);
  const totalWeeklyManualHours = vendorEditTimes.reduce((sum, v) => sum + v.weeklyManualHours, 0);
  const totalPotentialSavingsMinutes = vendorEditTimes.reduce((sum, v) => sum + v.potentialTimeSavingsMinutes, 0);

  // Manual time by vendor for chart
  const manualTimeChartData = [...vendorsWithTimes]
    .sort((a, b) => b.weeklyManualHours - a.weeklyManualHours)
    .slice(0, 6)
    .map(v => ({
      name: v.name.length > 12 ? v.name.substring(0, 10) + '...' : v.name,
      fullName: v.name,
      hours: v.weeklyManualHours,
      savings: v.potentialTimeSavingsMinutes / 60,
    }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Active Vendors</p>
          <p className="text-xl font-bold text-slate-900">{allVendors.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Avg Score</p>
          <p className="text-xl font-bold text-slate-900">
            {Math.round(allVendors.reduce((s, v) => s + v.score, 0) / allVendors.length)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Problematic (Score &lt;70)</p>
          <p className="text-xl font-bold text-red-600">{problematicVendors.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={12} className="text-amber-500" />
            <p className="text-xs text-slate-500">Weekly Manual Work</p>
          </div>
          <p className="text-xl font-bold text-amber-600">{formatHoursPerWeek(totalWeeklyManualHours)}</p>
          <p className="text-xs text-slate-400">
            from vendor edit requirements
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-1 mb-1">
            <Target size={12} className="text-emerald-500" />
            <p className="text-xs text-slate-500">Time Savings Potential</p>
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatHoursPerWeek(totalPotentialSavingsMinutes / 60)}</p>
          <p className="text-xs text-slate-400">if all reach best performer</p>
        </div>
      </div>

      {problematicVendors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800">
                {problematicVendors.length} vendor{problematicVendors.length > 1 ? 's' : ''} requiring configuration updates
              </h3>
              <p className="text-xs text-amber-700 mt-1">
                {problematicVendors.map(v => v.name).join(', ')} {problematicVendors.length > 1 ? 'have' : 'has'} scores
                below 70 and {problematicVendors.length > 1 ? 'are' : 'is'} causing {formatHoursPerWeek(problematicVendors.reduce((sum, v) => sum + v.weeklyManualHours, 0))} of manual edits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={chartData} title="Vendor Scores" height={260} />

        {/* Manual Time by Vendor Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Weekly Manual Time by Vendor
            </h3>
            <span className="text-xs text-slate-500">Top 6 by time impact</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={manualTimeChartData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}h`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(value, name) => {
                  if (name === 'hours') return [`${Number(value).toFixed(1)} hrs/week`, 'Manual Time'];
                  return [`${Number(value).toFixed(1)} hrs/week`, 'Potential Savings'];
                }}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
              />
              <Bar dataKey="hours" name="hours" radius={[0, 4, 4, 0]}>
                {manualTimeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hours > 2 ? '#f59e0b' : entry.hours > 1 ? '#fbbf24' : '#fde68a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors..."
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
                  ['name', 'Vendor'],
                  ['score', 'Score'],
                  ['invoiceCount', 'Invoices'],
                  ['totalSpend', 'Total Spend'],
                  ['poMatchRate', 'PO Match Rate'],
                  ['errorRate', 'Error Rate'],
                  ['weeklyManualHours', 'Weekly Manual Time'],
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
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">GL Mapping</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Avg Processing</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Time Savings</th>
              </tr>
            </thead>
            <tbody>
              {sortedVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    vendor.score < 70 ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-medium text-slate-900">{vendor.name}</td>
                  <td className="py-3 px-3"><ScoreBadge score={vendor.score} /></td>
                  <td className="py-3 px-3 text-slate-700">{formatNumber(vendor.invoiceCount)}</td>
                  <td className="py-3 px-3 text-slate-700">{formatCurrency(vendor.totalSpend)}</td>
                  <td className="py-3 px-3">
                    <span className={vendor.poMatchRate < 70 ? 'text-red-600 font-medium' : 'text-slate-700'}>
                      {formatPercent(vendor.poMatchRate)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={vendor.errorRate > 15 ? 'text-red-600 font-medium' : 'text-slate-700'}>
                      {formatPercent(vendor.errorRate)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className={`font-medium ${vendor.weeklyManualHours > 2 ? 'text-amber-600' : vendor.weeklyManualHours > 1 ? 'text-amber-500' : 'text-slate-700'}`}>
                        {formatHoursPerWeek(vendor.weeklyManualHours)}
                      </span>
                      <span className="text-xs text-slate-400">{vendor.editCount} edits</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{formatPercent(vendor.glMappingRate)}</td>
                  <td className="py-3 px-3 text-slate-700">{vendor.avgProcessingDays} days</td>
                  <td className="py-3 px-3">
                    {vendor.potentialTimeSavingsMinutes > 0 ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <TrendingDown size={12} />
                        <span className="text-xs font-medium">{formatMinutes(vendor.potentialTimeSavingsMinutes)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Best performer</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Time Impact Summary Footer */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-slate-500">Time calculation: ~{formatMinutes(3.5)} avg per edit action</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-600">
                Total Weekly Impact: <span className="font-semibold text-amber-600">{formatHoursPerWeek(totalWeeklyManualHours)}</span>
              </span>
              <span className="text-slate-600">
                Recoverable: <span className="font-semibold text-emerald-600">{formatHoursPerWeek(totalPotentialSavingsMinutes / 60)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

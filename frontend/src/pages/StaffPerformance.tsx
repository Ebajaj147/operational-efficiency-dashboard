import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, TrendingUp, TrendingDown, Users, ChevronDown, ChevronUp, FileText, X, Calendar, Filter, Download, Clock, Edit3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { PerformanceBadge } from '../components/common/PerformanceBadge';
import { useFilters } from '../context/FilterContext';
import { getUserMetrics, getWeeklyTeamMetrics, getWeeklyUserMetrics, getStaffInvoices } from '../data/mockData';
import type { WeeklyUserMetrics } from '../data/mockData';
import { formatPercent, formatMinutes, formatHoursPerWeek } from '../utils/formatters';
import type { UserMetrics } from '../types';

type SortField = 'name' | 'dailyAverage' | 'vsTeamAverage' | 'editRate' | 'manualMinutesPerInvoice';
type SortDir = 'asc' | 'desc';

export function StaffPerformance() {
  const { selectedLocations, dateRange } = useFilters();
  const allUsers = getUserMetrics(selectedLocations, dateRange);
  const weeklyTeamMetrics = getWeeklyTeamMetrics(selectedLocations, dateRange);
  const weeklyUserMetrics = getWeeklyUserMetrics(selectedLocations, dateRange);

  const [sortField, setSortField] = useState<SortField>('vsTeamAverage');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'edited' | 'touchless'>('all');

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.locationName.toLowerCase().includes(search.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
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

  const teamAvg = allUsers.reduce((sum, u) => sum + u.dailyAverage, 0) / allUsers.length;
  const topPerformer = [...allUsers].sort((a, b) => b.dailyAverage - a.dailyAverage)[0];

  // Calculate team-wide edit impact (this is about Ottimate gaps, not user performance)
  const totalWeeklyManualMinutes = allUsers.reduce((sum, u) => {
    const weeklyInvoices = u.dailyAverage * 7;
    return sum + (weeklyInvoices * u.editRate / 100 * u.manualMinutesPerInvoice);
  }, 0);

  // Calculate WoW changes for team
  const currentWeek = weeklyTeamMetrics[weeklyTeamMetrics.length - 1];
  const previousWeek = weeklyTeamMetrics[weeklyTeamMetrics.length - 2];
  const wowChange = previousWeek ? {
    dailyAvg: ((currentWeek.avgDailyPerPerson - previousWeek.avgDailyPerPerson) / previousWeek.avgDailyPerPerson * 100),
    editRate: currentWeek.avgEditRate - previousWeek.avgEditRate,
    processingHours: currentWeek.avgProcessingHours - previousWeek.avgProcessingHours,
  } : null;

  const openInvoiceModal = (userId: string) => {
    setSelectedUserId(userId);
    setShowInvoiceModal(true);
    setInvoiceFilter('all');
  };

  const getUserWeeklyData = (userId: string): WeeklyUserMetrics | undefined => {
    return weeklyUserMetrics.find(u => u.userId === userId);
  };

  return (
    <div className="space-y-6">
      {/* Team Summary Cards with WoW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-slate-400" />
            <p className="text-xs text-slate-500">Team Members</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{allUsers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Team Avg (Daily)</p>
          <p className="text-xl font-bold text-slate-900">{teamAvg.toFixed(1)} invoices</p>
          {wowChange && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${wowChange.dailyAvg >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {wowChange.dailyAvg >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{wowChange.dailyAvg >= 0 ? '+' : ''}{wowChange.dailyAvg.toFixed(1)}% WoW</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Top Performer</p>
          <p className="text-xl font-bold text-emerald-600">{topPerformer?.name}</p>
          <p className="text-xs text-slate-500">{topPerformer?.dailyAverage.toFixed(1)}/day</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={12} className="text-amber-500" />
            <p className="text-xs text-slate-500">Manual Work (Team)</p>
          </div>
          <p className="text-xl font-bold text-amber-600">{formatHoursPerWeek(totalWeeklyManualMinutes / 60)}</p>
          <p className="text-xs text-slate-400">Due to required edits</p>
        </div>
      </div>

      {/* Context Note - Edits are Ottimate gaps, not user fault */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Edit3 size={16} className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">About Edit Rates</p>
            <p className="text-xs text-blue-700 mt-1">
              Edit rates reflect invoices requiring manual changes due to Ottimate configuration gaps (missing vendor mappings, GL codes, etc.) —
              not user performance. High edit rates indicate opportunities to improve Ottimate settings.
            </p>
          </div>
        </div>
      </div>

      {/* Week-on-Week Team Trend Charts */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" />
          Week-on-Week Team Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Average Trend */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Avg Daily Invoices/Person</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={weeklyTeamMetrics}>
                <XAxis dataKey="weekLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value) => [Number(value).toFixed(1), 'Daily Avg']}
                />
                <Line type="monotone" dataKey="avgDailyPerPerson" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Edit Rate Trend */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Edit Rate % (Ottimate Gaps)</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={weeklyTeamMetrics}>
                <XAxis dataKey="weekLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Edit Rate']}
                />
                <Line type="monotone" dataKey="avgEditRate" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Manual Minutes Per Invoice Trend */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Avg Manual Time/Invoice</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={weeklyTeamMetrics}>
                <XAxis dataKey="weekLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={(v) => `${v}m`} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value) => [`${Number(value).toFixed(1)} min`, 'Manual Time']}
                />
                <Line type="monotone" dataKey="avgManualMinutes" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="w-8"></th>
                {([
                  ['name', 'Name'],
                  ['dailyAverage', 'Daily Avg'],
                  ['vsTeamAverage', 'vs Team'],
                  ['editRate', 'Edit Rate'],
                  ['manualMinutesPerInvoice', 'Manual Time'],
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
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">WoW Change</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Location</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Status</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user: UserMetrics) => {
                const userWeekly = getUserWeeklyData(user.id);
                const isExpanded = expandedUser === user.id;
                const userWoW = userWeekly && userWeekly.weekData.length >= 2 ? {
                  current: userWeekly.weekData[userWeekly.weekData.length - 1],
                  previous: userWeekly.weekData[userWeekly.weekData.length - 2],
                } : null;
                const wowDailyChange = userWoW ?
                  ((userWoW.current.dailyAverage - userWoW.previous.dailyAverage) / userWoW.previous.dailyAverage * 100) : 0;

                return (
                  <>
                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2">
                        <button
                          onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">{user.name}</td>
                      <td className="py-3 px-3 text-slate-700">{user.dailyAverage.toFixed(1)}</td>
                      <td className="py-3 px-3">
                        <span className={`flex items-center gap-1 ${user.vsTeamAverage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {user.vsTeamAverage >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {user.vsTeamAverage > 0 ? '+' : ''}{user.vsTeamAverage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{formatPercent(user.editRate)}</td>
                      <td className="py-3 px-3 text-slate-700">{formatMinutes(user.manualMinutesPerInvoice)}</td>
                      <td className="py-3 px-3">
                        {userWoW && (
                          <span className={`flex items-center gap-1 text-xs ${wowDailyChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {wowDailyChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {wowDailyChange >= 0 ? '+' : ''}{wowDailyChange.toFixed(1)}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{user.locationName}</td>
                      <td className="py-3 px-3">
                        <PerformanceBadge category={user.performanceCategory} />
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => openInvoiceModal(user.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <FileText size={12} />
                          View Invoices
                        </button>
                      </td>
                    </tr>
                    {isExpanded && userWeekly && (
                      <tr key={`${user.id}-expanded`}>
                        <td colSpan={10} className="bg-slate-50 p-4">
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-slate-700">Weekly Performance Trend - {user.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Weekly Invoice Count */}
                              <div className="bg-white rounded-lg p-3 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-2">Weekly Invoice Count</p>
                                <ResponsiveContainer width="100%" height={100}>
                                  <BarChart data={userWeekly.weekData}>
                                    <XAxis dataKey="weekLabel" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={40} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ fontSize: 11 }} />
                                    <Bar dataKey="invoiceCount" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                      {userWeekly.weekData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === userWeekly.weekData.length - 1 ? '#3b82f6' : '#93c5fd'} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>

                              {/* Weekly Edit Rate */}
                              <div className="bg-white rounded-lg p-3 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-2">Edit Rate Trend (Vendor Mix)</p>
                                <ResponsiveContainer width="100%" height={100}>
                                  <LineChart data={userWeekly.weekData}>
                                    <XAxis dataKey="weekLabel" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={40} />
                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                                    <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`${v}%`, 'Edit Rate']} />
                                    <Line type="monotone" dataKey="editRate" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Weekly Summary Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 px-2 font-medium text-slate-600">Week</th>
                                    <th className="text-right py-2 px-2 font-medium text-slate-600">Invoices</th>
                                    <th className="text-right py-2 px-2 font-medium text-slate-600">Daily Avg</th>
                                    <th className="text-right py-2 px-2 font-medium text-slate-600">Edit Rate</th>
                                    <th className="text-right py-2 px-2 font-medium text-slate-600">Manual Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {userWeekly.weekData.map((week, idx) => {
                                    const prevWeek = idx > 0 ? userWeekly.weekData[idx - 1] : null;
                                    const dailyChange = prevWeek ? week.dailyAverage - prevWeek.dailyAverage : 0;
                                    return (
                                      <tr key={week.week} className={`border-b border-slate-100 ${idx === userWeekly.weekData.length - 1 ? 'bg-blue-50' : ''}`}>
                                        <td className="py-2 px-2 text-slate-700">{week.weekLabel}</td>
                                        <td className="py-2 px-2 text-right text-slate-700">{week.invoiceCount}</td>
                                        <td className="py-2 px-2 text-right">
                                          <span className="text-slate-700">{week.dailyAverage.toFixed(1)}</span>
                                          {prevWeek && (
                                            <span className={`ml-1 ${dailyChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                              ({dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(1)})
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2 text-right text-slate-700">{week.editRate.toFixed(1)}%</td>
                                        <td className="py-2 px-2 text-right text-slate-700">{week.manualMinutes.toFixed(1)} min</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Drill-Down Modal */}
      {showInvoiceModal && selectedUserId && (
        <StaffInvoiceModal
          userId={selectedUserId}
          userName={allUsers.find(u => u.id === selectedUserId)?.name || ''}
          dateRange={dateRange}
          filter={invoiceFilter}
          onFilterChange={setInvoiceFilter}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
}

// Staff Invoice Modal Component
interface StaffInvoiceModalProps {
  userId: string;
  userName: string;
  dateRange: '7d' | '30d' | '90d';
  filter: 'all' | 'edited' | 'touchless';
  onFilterChange: (filter: 'all' | 'edited' | 'touchless') => void;
  onClose: () => void;
}

function StaffInvoiceModal({ userId, userName, dateRange, filter, onFilterChange, onClose }: StaffInvoiceModalProps) {
  const invoices = getStaffInvoices(userId, dateRange);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Filter invoices
  let filteredInvoices = invoices;
  if (filter === 'edited') {
    filteredInvoices = invoices.filter(inv => inv.status === 'edited');
  } else if (filter === 'touchless') {
    filteredInvoices = invoices.filter(inv => inv.touchless);
  }

  if (searchTerm) {
    filteredInvoices = filteredInvoices.filter(inv =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Summary stats
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const editCount = invoices.filter(inv => inv.status === 'edited').length;
  const touchlessCount = invoices.filter(inv => inv.touchless).length;
  const totalManualMinutes = invoices.reduce((sum, inv) => sum + inv.manualMinutes, 0);

  const exportCSV = () => {
    const headers = ['Invoice #', 'Vendor', 'Amount', 'Status', 'Edit Type', 'Manual Minutes', 'Date', 'Touchless'];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      inv.vendorName,
      inv.amount.toFixed(2),
      inv.status,
      inv.editType || '',
      inv.manualMinutes.toString(),
      inv.processedDate,
      inv.touchless ? 'Yes' : 'No'
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName.replace(/\s+/g, '_')}_invoices_${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Invoice History - {userName}</h2>
            <p className="text-sm text-slate-500">
              {dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500">Total Invoices</p>
            <p className="text-lg font-bold text-slate-900">{invoices.length}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500">Total Amount</p>
            <p className="text-lg font-bold text-slate-900">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500">Required Edits</p>
            <p className="text-lg font-bold text-amber-600">{editCount} ({((editCount/invoices.length)*100).toFixed(1)}%)</p>
            <p className="text-xs text-slate-400">{formatMinutes(totalManualMinutes)} total</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500">Touchless</p>
            <p className="text-lg font-bold text-emerald-600">{touchlessCount} ({((touchlessCount/invoices.length)*100).toFixed(1)}%)</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice # or vendor..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="text-sm outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filter}
              onChange={(e) => { onFilterChange(e.target.value as 'all' | 'edited' | 'touchless'); setCurrentPage(1); }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
            >
              <option value="all">All Invoices</option>
              <option value="edited">Required Edits</option>
              <option value="touchless">Touchless Only</option>
            </select>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Invoice Table */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-medium text-slate-600">Invoice #</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Vendor</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">Amount</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Status</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Edit Type</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">Manual Time</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-slate-700">{inv.invoiceNumber}</td>
                  <td className="py-2 px-3 text-slate-700">{inv.vendorName}</td>
                  <td className="py-2 px-3 text-right text-slate-700">${inv.amount.toLocaleString()}</td>
                  <td className="py-2 px-3">
                    {inv.status === 'edited' ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">Required Edit</span>
                    ) : inv.touchless ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">Touchless</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">Processed</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-500 text-xs">{inv.editType || '-'}</td>
                  <td className="py-2 px-3 text-right text-slate-700">
                    {inv.manualMinutes > 0 ? formatMinutes(inv.manualMinutes) : '-'}
                  </td>
                  <td className="py-2 px-3 text-slate-500">{inv.processedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No invoices found matching your criteria
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

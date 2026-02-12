import { useState } from 'react';
import { FileText, Download, Calendar, Mail, Clock, Check, Loader2, Eye } from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { getOverviewMetrics, getLocationMetrics, getVendorMetrics, getUserMetrics, getWeeklyTeamMetrics, getWeeklyUserMetrics, getVendorEditTimes } from '../data/mockData';
import { formatPercent, formatNumber, formatMinutes, formatHoursPerWeek, formatFTE } from '../utils/formatters';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'operational' | 'vendor' | 'staff';
  frequency: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'exec_summary',
    name: 'Executive Summary',
    description: 'High-level KPIs, time savings, and strategic insights for leadership',
    type: 'executive',
    frequency: 'Monthly',
  },
  {
    id: 'ops_review',
    name: 'Operational Review',
    description: 'Detailed metrics by location with trend analysis and recommendations',
    type: 'operational',
    frequency: 'Weekly',
  },
  {
    id: 'vendor_scorecard',
    name: 'Vendor Scorecard',
    description: 'Vendor performance rankings, edit impact, and action items',
    type: 'vendor',
    frequency: 'Monthly',
  },
  {
    id: 'staff_performance',
    name: 'Staff Performance Report',
    description: 'Individual and team metrics with workload analysis',
    type: 'staff',
    frequency: 'Weekly',
  },
  {
    id: 'edit_analysis',
    name: 'Edit Analysis',
    description: 'Deep dive into edit patterns, root causes, and Ottimate configuration gaps',
    type: 'operational',
    frequency: 'Weekly',
  },
];

interface ScheduledReport {
  id: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  nextRun: string;
  enabled: boolean;
}

export function Reports() {
  const { selectedLocations, dateRange } = useFilters();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 'sched_1',
      templateId: 'exec_summary',
      frequency: 'monthly',
      recipients: ['cfo@company.com', 'vp-finance@company.com'],
      nextRun: getNextMonday(),
      enabled: true,
    },
    {
      id: 'sched_2',
      templateId: 'ops_review',
      frequency: 'weekly',
      recipients: ['ap-manager@company.com'],
      nextRun: getNextMonday(),
      enabled: true,
    },
  ]);
  const [showScheduleModal, setShowScheduleModal] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({ frequency: 'weekly', recipients: '' });

  const handleGenerate = async (templateId: string) => {
    setGeneratingId(templateId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratingId(null);
    setPreviewReport(templateId);
  };

  const handleDownload = (templateId: string) => {
    const report = generateReportContent(templateId, selectedLocations, dateRange);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateId}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const handleSchedule = (templateId: string) => {
    if (!newSchedule.recipients.trim()) return;

    const newReport: ScheduledReport = {
      id: `sched_${Date.now()}`,
      templateId,
      frequency: newSchedule.frequency as 'daily' | 'weekly' | 'monthly',
      recipients: newSchedule.recipients.split(',').map(e => e.trim()),
      nextRun: getNextRunDate(newSchedule.frequency as 'daily' | 'weekly' | 'monthly'),
      enabled: true,
    };

    setScheduledReports(prev => [...prev, newReport]);
    setShowScheduleModal(null);
    setNewSchedule({ frequency: 'weekly', recipients: '' });
  };

  const toggleSchedule = (id: string) => {
    setScheduledReports(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  };

  const deleteSchedule = (id: string) => {
    setScheduledReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Available Templates</p>
          <p className="text-xl font-bold text-slate-900">{reportTemplates.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Scheduled Reports</p>
          <p className="text-xl font-bold text-slate-900">{scheduledReports.filter(r => r.enabled).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Reports This Month</p>
          <p className="text-xl font-bold text-slate-900">12</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Recipients</p>
          <p className="text-xl font-bold text-slate-900">
            {new Set(scheduledReports.flatMap(r => r.recipients)).size}
          </p>
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTemplates.map(template => (
            <div
              key={template.id}
              className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  template.type === 'executive' ? 'bg-purple-100 text-purple-600' :
                  template.type === 'operational' ? 'bg-blue-100 text-blue-600' :
                  template.type === 'vendor' ? 'bg-amber-100 text-amber-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400">{template.frequency}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleGenerate(template.id)}
                  disabled={generatingId === template.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {generatingId === template.id ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye size={12} />
                      Generate
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload(template.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Download size={12} />
                  Download
                </button>
                <button
                  onClick={() => setShowScheduleModal(template.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Mail size={12} />
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Scheduled Reports</h2>
        {scheduledReports.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No scheduled reports. Use the Schedule button above to set up automated reports.</p>
        ) : (
          <div className="space-y-3">
            {scheduledReports.map(schedule => {
              const template = reportTemplates.find(t => t.id === schedule.templateId);
              return (
                <div
                  key={schedule.id}
                  className={`border rounded-xl p-4 ${schedule.enabled ? 'border-slate-200' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        schedule.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {schedule.enabled ? <Check size={16} /> : <Clock size={16} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{template?.name}</p>
                        <p className="text-xs text-slate-500">
                          {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} • {schedule.recipients.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Next: {schedule.nextRun}</span>
                      <button
                        onClick={() => toggleSchedule(schedule.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${
                          schedule.enabled
                            ? 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                            : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                        }`}
                      >
                        {schedule.enabled ? 'Pause' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowScheduleModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Schedule Report</h3>
            <p className="text-sm text-slate-500 mb-4">
              {reportTemplates.find(t => t.id === showScheduleModal)?.name}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                <select
                  value={newSchedule.frequency}
                  onChange={e => setNewSchedule(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipients (comma separated)</label>
                <input
                  type="text"
                  value={newSchedule.recipients}
                  onChange={e => setNewSchedule(prev => ({ ...prev, recipients: e.target.value }))}
                  placeholder="email1@company.com, email2@company.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSchedule(showScheduleModal)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPreviewReport(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {reportTemplates.find(t => t.id === previewReport)?.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewReport)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <Download size={12} />
                  Download
                </button>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <Calendar size={16} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 border border-slate-200 rounded-xl p-4">
                {generateReportContent(previewReport, selectedLocations, dateRange)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getNextMonday(): string {
  const today = new Date();
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
  const nextMonday = new Date(today.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
  return nextMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNextRunDate(frequency: 'daily' | 'weekly' | 'monthly'): string {
  const today = new Date();
  let nextDate: Date;

  switch (frequency) {
    case 'daily':
      nextDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
      nextDate = new Date(today.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      nextDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      break;
  }

  return nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function generateReportContent(templateId: string, selectedLocations: string[], dateRange: '7d' | '30d' | '90d'): string {
  const metrics = getOverviewMetrics(selectedLocations, dateRange);
  const locations = getLocationMetrics(selectedLocations, dateRange);
  const vendors = getVendorMetrics(selectedLocations, dateRange);
  const staff = getUserMetrics(selectedLocations, dateRange);
  const weeklyTeam = getWeeklyTeamMetrics(selectedLocations, dateRange);
  const weeklyUsers = getWeeklyUserMetrics(selectedLocations, dateRange);
  const vendorEditTimes = getVendorEditTimes(dateRange);

  // Calculate time metrics
  const weeksInRange = dateRange === '7d' ? 1 : dateRange === '30d' ? 4.3 : 13;
  const weeklyManualHours = metrics.totalManualHours / weeksInRange;
  const totalWeeklyVendorHours = vendorEditTimes.reduce((sum, v) => sum + v.weeklyManualHours, 0);
  const totalPotentialSavings = vendorEditTimes.reduce((sum, v) => sum + v.potentialTimeSavingsMinutes, 0);

  const header = `
════════════════════════════════════════════════════════════════
                    OTTIMATE OPERATIONAL EFFICIENCY
                         ${templateId.replace('_', ' ').toUpperCase()}
════════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Period: Last ${dateRange === '7d' ? '7 Days' : dateRange === '30d' ? '30 Days' : '90 Days'}
Locations: ${selectedLocations.length > 0 ? locations.map(l => l.name).join(', ') : 'All'}

`;

  switch (templateId) {
    case 'exec_summary':
      return header + `
KEY PERFORMANCE INDICATORS
────────────────────────────────────────────────────────────────

Total Invoices Processed:     ${formatNumber(metrics.totalInvoices)}
Average Processing Time:      ${metrics.avgProcessingDays.toFixed(1)} days
Edit Rate:                    ${formatPercent(metrics.editRate)}
Touchless Processing Rate:    ${formatPercent(metrics.touchlessRate)}
Manual Time Per Invoice:      ${formatMinutes(metrics.manualMinutesPerInvoice)}
Weekly Manual Work:           ${formatHoursPerWeek(weeklyManualHours)}

PERIOD-OVER-PERIOD TRENDS
────────────────────────────────────────────────────────────────

Invoice Volume:      ${metrics.totalInvoicesTrend > 0 ? '↑' : '↓'} ${Math.abs(metrics.totalInvoicesTrend).toFixed(1)}%
Processing Time:     ${metrics.avgProcessingDaysTrend < 0 ? '↓ (Improved)' : '↑ (Slower)'} ${Math.abs(metrics.avgProcessingDaysTrend).toFixed(1)}%
Edit Rate:           ${metrics.editRateTrend < 0 ? '↓ (Improved)' : '↑ (More edits)'} ${Math.abs(metrics.editRateTrend).toFixed(1)}%
Manual Time:         ${metrics.manualMinutesTrend < 0 ? '↓ (Improved)' : '↑ (More work)'} ${Math.abs(metrics.manualMinutesTrend).toFixed(1)}%

LOCATION PERFORMANCE SUMMARY
────────────────────────────────────────────────────────────────

${locations.map(l => `${l.name.padEnd(12)} Score: ${l.score.toFixed(0).padStart(3)}  |  Touchless: ${formatPercent(l.touchlessRate).padStart(6)}  |  Manual: ${formatHoursPerWeek(l.weeklyManualHours)}`).join('\n')}

TOP PERFORMER: ${locations.sort((a, b) => b.score - a.score)[0]?.name} (Score: ${locations.sort((a, b) => b.score - a.score)[0]?.score.toFixed(0)})
NEEDS ATTENTION: ${locations.sort((a, b) => a.score - b.score)[0]?.name} (Score: ${locations.sort((a, b) => a.score - b.score)[0]?.score.toFixed(0)})

TIME SAVINGS OPPORTUNITY
────────────────────────────────────────────────────────────────

Current Manual Work:          ${formatHoursPerWeek(weeklyManualHours)} (${formatFTE(weeklyManualHours)})
Potential Savings:            ${formatHoursPerWeek(totalPotentialSavings / 60)}
FTE Equivalent Savings:       ${formatFTE(totalPotentialSavings / 60)}

If all locations achieved Austin-level performance:
Annual Time Savings: ~${Math.round(totalPotentialSavings / 60 * 52)} hours

════════════════════════════════════════════════════════════════
                         END OF REPORT
════════════════════════════════════════════════════════════════
`;

    case 'vendor_scorecard':
      const sortedVendors = [...vendors].sort((a, b) => a.score - b.score);
      const problematic = sortedVendors.filter(v => v.score < 70);

      return header + `
VENDOR PERFORMANCE SCORECARD
────────────────────────────────────────────────────────────────

MANUAL WORK IMPACT SUMMARY
────────────────────────────────────────────────────────────────

Total Weekly Manual Hours:         ${formatHoursPerWeek(totalWeeklyVendorHours)}
Potential Time Savings:            ${formatHoursPerWeek(totalPotentialSavings / 60)}
FTE Equivalent Impact:             ${formatFTE(totalWeeklyVendorHours)}
Average Time Per Edit:             ${formatMinutes(3.5)}

VENDOR RANKINGS (by Score)
────────────────────────────────────────────────────────────────

${sortedVendors.map((v, i) => {
  const timeData = vendorEditTimes.find(c => c.vendorId === v.id);
  return `${String(i + 1).padStart(2)}. ${v.name.padEnd(20)} Score: ${String(v.score).padStart(3)}  |  PO Match: ${formatPercent(v.poMatchRate).padStart(6)}  |  Weekly Time: ${formatHoursPerWeek(timeData?.weeklyManualHours || 0)}`;
}).join('\n')}

MANUAL TIME BY VENDOR
────────────────────────────────────────────────────────────────

${vendorEditTimes.sort((a, b) => b.weeklyManualHours - a.weeklyManualHours).map(v =>
  `${v.vendorName.padEnd(20)} Edits: ${String(v.editCount).padStart(4)}  |  Weekly: ${formatHoursPerWeek(v.weeklyManualHours).padStart(12)}  |  Savings: ${formatMinutes(v.potentialTimeSavingsMinutes).padStart(10)}`
).join('\n')}

VENDORS REQUIRING ATTENTION (Score < 70)
────────────────────────────────────────────────────────────────

${problematic.length > 0 ? problematic.map(v => {
  const timeData = vendorEditTimes.find(c => c.vendorId === v.id);
  return `
⚠️  ${v.name}
    Score: ${v.score} | PO Match Rate: ${formatPercent(v.poMatchRate)}
    GL Mapping: ${formatPercent(v.glMappingRate)} | Error Rate: ${formatPercent(v.errorRate)}
    Weekly Manual Time: ${formatHoursPerWeek(timeData?.weeklyManualHours || 0)}
    Potential Savings: ${formatMinutes(timeData?.potentialTimeSavingsMinutes || 0)}

    RECOMMENDED ACTION: Update vendor configuration in Ottimate
`;
}).join('\n') : 'All vendors meeting minimum standards.'}

════════════════════════════════════════════════════════════════
                         END OF REPORT
════════════════════════════════════════════════════════════════
`;

    case 'staff_performance':
      const sortedStaff = [...staff].sort((a, b) => b.vsTeamAverage - a.vsTeamAverage);
      const exceptional = sortedStaff.filter(s => s.performanceCategory === 'Exceptional');

      const currentWeek = weeklyTeam[weeklyTeam.length - 1];
      const previousWeek = weeklyTeam[weeklyTeam.length - 2];
      const wowTeamChange = previousWeek ? {
        dailyAvg: ((currentWeek.avgDailyPerPerson - previousWeek.avgDailyPerPerson) / previousWeek.avgDailyPerPerson * 100),
        editRate: currentWeek.avgEditRate - previousWeek.avgEditRate,
        manualMinutes: ((currentWeek.avgManualMinutes - previousWeek.avgManualMinutes) / previousWeek.avgManualMinutes * 100),
      } : null;

      return header + `
STAFF PERFORMANCE REPORT
────────────────────────────────────────────────────────────────

TEAM SUMMARY
────────────────────────────────────────────────────────────────

Total Team Members:           ${staff.length}
Team Average (Daily):         ${(staff.reduce((s, u) => s + u.dailyAverage, 0) / staff.length).toFixed(1)} invoices
Average Edit Rate:            ${formatPercent(staff.reduce((s, u) => s + u.editRate, 0) / staff.length)}

Note: Edit rates reflect Ottimate configuration gaps for each
user's vendor mix - NOT individual performance issues.

WEEK-ON-WEEK TEAM PERFORMANCE
────────────────────────────────────────────────────────────────

${weeklyTeam.map((w, idx) => {
  const prev = idx > 0 ? weeklyTeam[idx - 1] : null;
  const change = prev ? ((w.avgDailyPerPerson - prev.avgDailyPerPerson) / prev.avgDailyPerPerson * 100) : 0;
  return `${w.weekLabel.padEnd(25)} Daily Avg: ${w.avgDailyPerPerson.toFixed(1).padStart(5)}  |  Edit Rate: ${w.avgEditRate.toFixed(1).padStart(5)}%  |  WoW: ${prev ? (change >= 0 ? '+' : '') + change.toFixed(1) + '%' : 'N/A'}`;
}).join('\n')}

${wowTeamChange ? `
CURRENT WEEK CHANGES:
  Daily Volume:     ${wowTeamChange.dailyAvg >= 0 ? '↑' : '↓'} ${Math.abs(wowTeamChange.dailyAvg).toFixed(1)}% ${wowTeamChange.dailyAvg >= 0 ? '(Improved)' : '(Declined)'}
  Edit Rate:        ${wowTeamChange.editRate <= 0 ? '↓' : '↑'} ${Math.abs(wowTeamChange.editRate).toFixed(1)}pp ${wowTeamChange.editRate <= 0 ? '(Fewer edits needed)' : '(More edits needed)'}
  Manual Time:      ${wowTeamChange.manualMinutes <= 0 ? '↓' : '↑'} ${Math.abs(wowTeamChange.manualMinutes).toFixed(1)}% ${wowTeamChange.manualMinutes <= 0 ? '(Less manual work)' : '(More manual work)'}
` : ''}

INDIVIDUAL PERFORMANCE WITH WOW TRENDS
────────────────────────────────────────────────────────────────

${sortedStaff.map(s => {
  const userWeekly = weeklyUsers.find(u => u.userId === s.id);
  let wowChange = 'N/A';
  if (userWeekly && userWeekly.weekData.length >= 2) {
    const curr = userWeekly.weekData[userWeekly.weekData.length - 1];
    const prev = userWeekly.weekData[userWeekly.weekData.length - 2];
    const change = ((curr.dailyAverage - prev.dailyAverage) / prev.dailyAverage * 100);
    wowChange = (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
  }
  return `${s.name.padEnd(18)} ${s.locationName.padEnd(8)} Daily: ${s.dailyAverage.toFixed(1).padStart(5)}  vs Avg: ${(s.vsTeamAverage > 0 ? '+' : '') + s.vsTeamAverage.toFixed(1).padStart(6)}%  WoW: ${wowChange.padStart(7)}  [${s.performanceCategory}]`;
}).join('\n')}

TOP PERFORMERS (Potential Mentors)
────────────────────────────────────────────────────────────────

${exceptional.map(s => `⭐ ${s.name} (${s.locationName}) - ${s.dailyAverage.toFixed(1)}/day, ${formatMinutes(s.manualMinutesPerInvoice)} per invoice`).join('\n')}

════════════════════════════════════════════════════════════════
                         END OF REPORT
════════════════════════════════════════════════════════════════
`;

    case 'ops_review':
      return header + `
OPERATIONAL REVIEW - COMPREHENSIVE ANALYSIS
────────────────────────────────────────────────────────────────

EXECUTIVE SUMMARY
────────────────────────────────────────────────────────────────

This report provides a comprehensive analysis of AP operations
with focus on time efficiency and Ottimate configuration optimization.

OVERALL PERFORMANCE METRICS
────────────────────────────────────────────────────────────────

Total Invoices Processed:     ${formatNumber(metrics.totalInvoices)}
Average Processing Time:      ${metrics.avgProcessingDays.toFixed(1)} days
Edit Rate:                    ${formatPercent(metrics.editRate)}
Touchless Rate:               ${formatPercent(metrics.touchlessRate)}
Manual Time Per Invoice:      ${formatMinutes(metrics.manualMinutesPerInvoice)}
Weekly Manual Work:           ${formatHoursPerWeek(weeklyManualHours)} (${formatFTE(weeklyManualHours)})

LOCATION PERFORMANCE BREAKDOWN
────────────────────────────────────────────────────────────────

${locations.sort((a, b) => b.score - a.score).map((l, i) => `
${i + 1}. ${l.name} (${l.region})
   Score: ${l.score.toFixed(0)}/100 | Staff: ${l.staffCount}
   ├─ Invoices: ${formatNumber(l.invoiceCount)}
   ├─ Touchless Rate: ${formatPercent(l.touchlessRate)}
   ├─ Edit Rate: ${formatPercent(l.editRate)}
   ├─ Avg Processing: ${(l.avgProcessingHours / 24).toFixed(1)} days
   └─ Weekly Manual Hours: ${formatHoursPerWeek(l.weeklyManualHours)}
`).join('')}

TIME OPTIMIZATION OPPORTUNITIES
────────────────────────────────────────────────────────────────

1. LOCATION OPTIMIZATION
   If all locations achieve Austin-level efficiency:
   Potential Weekly Savings: ${formatHoursPerWeek(totalPotentialSavings / 60)}

2. VENDOR OPTIMIZATION
   If all vendors achieve best performer edit rate:
   Potential Savings: ${formatHoursPerWeek(totalPotentialSavings / 60)}

3. OTTIMATE CONFIGURATION
   Improving GL mapping and vendor rules could save:
   Estimated Weekly: ${formatHoursPerWeek(weeklyManualHours * 0.3)}

TOTAL OPTIMIZATION POTENTIAL: ${formatHoursPerWeek(totalPotentialSavings / 60 + weeklyManualHours * 0.3)} weekly
Annual Impact: ~${Math.round((totalPotentialSavings / 60 + weeklyManualHours * 0.3) * 52)} hours saved

════════════════════════════════════════════════════════════════
                         END OF REPORT
════════════════════════════════════════════════════════════════
`;

    case 'edit_analysis':
      return header + `
EDIT ANALYSIS REPORT
────────────────────────────────────────────────────────────────

Note: Edits represent invoices requiring manual changes due to
Ottimate configuration gaps - these are system optimization
opportunities, NOT user performance issues.

EDIT OVERVIEW
────────────────────────────────────────────────────────────────

Total Edit Rate:              ${formatPercent(metrics.editRate)}
Touchless Rate:               ${formatPercent(metrics.touchlessRate)}
Weekly Manual Hours:          ${formatHoursPerWeek(weeklyManualHours)}
FTE Equivalent:               ${formatFTE(weeklyManualHours)}

EDIT BREAKDOWN BY TYPE
────────────────────────────────────────────────────────────────

Missing PO:           34% (412 invoices)  - ~${formatMinutes(4)} each
GL Code Mapping:      29% (348 invoices)  - ~${formatMinutes(4)} each
Vendor Mapping:       15% (181 invoices)  - ~${formatMinutes(3)} each
Amount Mismatch:      14% (169 invoices)  - ~${formatMinutes(3)} each
Duplicate Check:       8% (96 invoices)   - ~${formatMinutes(2)} each

MANUAL TIME BY VENDOR
────────────────────────────────────────────────────────────────

${vendorEditTimes.sort((a, b) => b.weeklyManualHours - a.weeklyManualHours).map(v =>
  `${v.vendorName.padEnd(20)} ${String(v.editCount).padStart(4)} edits  |  Weekly: ${formatHoursPerWeek(v.weeklyManualHours).padStart(12)}  |  Savings: ${formatMinutes(v.potentialTimeSavingsMinutes).padStart(10)}`
).join('\n')}

ROOT CAUSE ANALYSIS
────────────────────────────────────────────────────────────────

1. MISSING PO (34% of edits)
   Configuration Gap:
   • Vendors not mapped to require PO reference
   • PO matching rules too strict

   Recommended Ottimate Updates:
   • Review PO matching tolerance settings
   • Add vendor-specific PO rules
   • Enable fuzzy PO matching

2. GL CODE MAPPING (29% of edits)
   Configuration Gap:
   • New expense categories not mapped
   • Vendor product codes not linked to GL

   Recommended Ottimate Updates:
   • Run GL mapping wizard for top vendors
   • Enable AI-suggested GL coding
   • Schedule monthly GL rule review

3. VENDOR MAPPING (15% of edits)
   Configuration Gap:
   • New vendors not in master file
   • Vendor name variations not recognized

   Recommended Ottimate Updates:
   • Enable vendor name fuzzy matching
   • Add common vendor aliases
   • Review vendor onboarding workflow

TIME RECOVERY OPPORTUNITY
────────────────────────────────────────────────────────────────

If edit rate reduced by 50% through configuration improvements:
• Weekly Savings: ${formatHoursPerWeek(weeklyManualHours * 0.5)}
• Annual Savings: ~${Math.round(weeklyManualHours * 0.5 * 52)} hours
• FTE Equivalent: ${formatFTE(weeklyManualHours * 0.5)}

════════════════════════════════════════════════════════════════
                         END OF REPORT
════════════════════════════════════════════════════════════════
`;

    default:
      return header + `
OPERATIONAL REVIEW
────────────────────────────────────────────────────────────────

This report provides a comprehensive overview of AP operations.

KEY METRICS:
• Total Invoices: ${formatNumber(metrics.totalInvoices)}
• Edit Rate: ${formatPercent(metrics.editRate)}
• Weekly Manual Work: ${formatHoursPerWeek(weeklyManualHours)}

LOCATIONS: ${locations.length}
STAFF: ${staff.length}
VENDORS: ${vendors.length}

════════════════════════════════════════════════════════════════
                         END OF REPORT
════════════════════════════════════════════════════════════════
`;
  }
}

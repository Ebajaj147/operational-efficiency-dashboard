import { useState } from 'react';
import { FileText, Clock, Edit3, Zap } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { InsightList } from '../components/insights/InsightList';
import { TrendChart } from '../components/charts/TrendChart';
import { EditBreakdownChart } from '../components/charts/EditBreakdownChart';
import { TimeBreakdownCard } from '../components/roi/TimeBreakdownCard';
import { OpportunitiesCard } from '../components/roi/OpportunitiesCard';
import { useFilters } from '../context/FilterContext';
import {
  getOverviewMetrics,
  getInsights,
  getProcessingVolumeTrend,
  getEditRateTrend,
  getEditBreakdown,
  getROISummary,
} from '../data/mockData';
import { formatNumber, formatPercent, formatMinutes } from '../utils/formatters';
import type { TimeCategory, OpportunityAction } from '../types';
import { InvoiceDrillDownModal, generateSampleInvoices } from '../components/modals/InvoiceDrillDownModal';

export function Overview() {
  const { selectedLocations, dateRange } = useFilters();
  const metrics = getOverviewMetrics(selectedLocations, dateRange);
  const insights = getInsights();
  const volumeTrend = getProcessingVolumeTrend(dateRange);
  const editTrend = getEditRateTrend(dateRange);
  const editBreakdown = getEditBreakdown();
  const roiSummary = getROISummary(selectedLocations, dateRange);

  const [showDrillDown, setShowDrillDown] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownInvoices, setDrillDownInvoices] = useState<ReturnType<typeof generateSampleInvoices>>([]);

  const dateRangeLabel = dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : 'Last 90 Days';

  const handleCategoryClick = (category: TimeCategory) => {
    // Generate sample invoices for drill-down
    const invoices = generateSampleInvoices(category.invoice_count || 50);
    setDrillDownInvoices(invoices);
    setDrillDownTitle(category.name || 'All Edits');
    setShowDrillDown(true);
  };

  const handleActionClick = (action: OpportunityAction) => {
    // In production, this would open the appropriate action drawer
    console.log('Action clicked:', action);
    alert(`Action: ${action.label}\n\n${action.description}\n\nThis would open the ${action.action_type} workflow.`);
  };

  return (
    <div className="space-y-6">
      {/* NEW: ROI Summary Section - Two Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeBreakdownCard
          data={roiSummary.time_breakdown}
          onCategoryClick={handleCategoryClick}
          dateRangeLabel={dateRangeLabel}
        />
        <OpportunitiesCard
          opportunities={roiSummary.opportunities}
          summary={roiSummary.summary}
          onActionClick={handleActionClick}
        />
      </div>

      {/* Key KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Invoices"
          value={formatNumber(metrics.totalInvoices)}
          trend={metrics.totalInvoicesTrend}
          trendLabel="vs prev"
          icon={<FileText size={18} />}
        />
        <MetricCard
          title="Touchless Rate"
          value={formatPercent(metrics.touchlessRate)}
          trend={metrics.touchlessRateTrend}
          trendLabel="vs prev"
          icon={<Zap size={18} />}
          highlight
        />
        <MetricCard
          title="Edit Rate"
          value={formatPercent(metrics.editRate)}
          trend={metrics.editRateTrend}
          lowerIsBetter
          trendLabel="vs prev"
          icon={<Edit3 size={18} />}
        />
        <MetricCard
          title="Avg Processing"
          value={`${metrics.avgProcessingDays.toFixed(1)} days`}
          trend={metrics.avgProcessingDaysTrend}
          lowerIsBetter
          trendLabel="vs prev"
          icon={<Clock size={18} />}
        />
        <MetricCard
          title="Manual Time/Invoice"
          value={formatMinutes(metrics.manualMinutesPerInvoice)}
          trend={metrics.manualMinutesTrend}
          lowerIsBetter
          trendLabel="vs prev"
          icon={<Edit3 size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TrendChart
            data={volumeTrend}
            title="Daily Processing Volume"
            color="#3b82f6"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TrendChart
              data={editTrend}
              title="Edit Rate Trend"
              color="#f59e0b"
              unit="%"
              height={180}
            />
            <EditBreakdownChart data={editBreakdown} height={180} />
          </div>
        </div>
        <div>
          <InsightList insights={insights} limit={5} />
        </div>
      </div>

      {/* Invoice Drill-Down Modal */}
      <InvoiceDrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        title={`Invoices: ${drillDownTitle}`}
        subtitle={`${drillDownInvoices.length} invoices • Total: $${drillDownInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`}
        invoices={drillDownInvoices}
      />
    </div>
  );
}

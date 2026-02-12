import { useState } from 'react';
import { AlertCircle, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Sparkles, Eye, Clock, TrendingDown } from 'lucide-react';
import type { Insight } from '../../types';
import { severityColors } from '../../utils/colors';
import { formatRelativeTime, formatHoursPerWeek } from '../../utils/formatters';
import { ActionDrawer, type ActionType } from '../actions/ActionDrawer';
import { InvoiceDrillDownModal, generateSampleInvoices } from '../modals/InvoiceDrillDownModal';

interface InsightCardProps {
  insight: Insight;
}

const severityIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  opportunity: Lightbulb,
};

const actionLabels: Record<string, string> = {
  assign_mentor: 'Assign Mentor',
  prepare_review: 'Prepare Review',
  start_vendor_workflow: 'Start Vendor Workflow',
  generate_location_comparison: 'Generate Comparison',
  set_benchmark_target: 'Set Benchmark',
  request_sop_upload: 'Request SOP',
  generate_training_recommendation: 'Training Plan',
};

export function InsightCard({ insight }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const colors = severityColors[insight.severity];
  const Icon = severityIcons[insight.severity];

  const handleActionClick = (action: string) => {
    setActiveAction(action as ActionType);
  };

  const sampleInvoices = generateSampleInvoices(
    Math.floor(20 + Math.random() * 30),
    insight.entities.vendorId ? { vendor: insight.title.split(' ')[0] } : undefined
  );

  // Time-based impact
  const weeklyHours = insight.timeImpactMinutes / 60;
  const annualizedHours = weeklyHours * 52;

  return (
    <>
      <div className={`rounded-xl border ${colors.border} overflow-hidden`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full text-left p-4 ${colors.bg} hover:brightness-95 transition-all`}
        >
          <div className="flex items-start gap-3">
            <Icon size={18} className={`mt-0.5 ${colors.icon}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`text-sm font-semibold ${colors.text} truncate`}>{insight.title}</h4>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{insight.description}</p>

              {/* Time Impact - Prominent Display */}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 rounded-lg border border-emerald-200">
                  <Clock size={14} className="text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">{formatHoursPerWeek(weeklyHours)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <TrendingDown size={12} />
                  <span>~{Math.round(annualizedHours)} hrs/year potential savings</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2">{formatRelativeTime(insight.generatedAt)}</p>
            </div>
            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>
        </button>

        {isExpanded && (
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Recommendation</p>
              <p className="text-sm text-slate-700">{insight.recommendation}</p>
            </div>

            {/* Drill-down button */}
            <div className="mb-3">
              <button
                onClick={() => setShowDrillDown(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <Eye size={12} />
                View Related Invoices ({sampleInvoices.length})
              </button>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-2">AI-Assisted Actions</p>
              <div className="flex flex-wrap gap-2">
                {insight.actions.map(action => (
                  <button
                    key={action}
                    onClick={() => handleActionClick(action)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:shadow-md hover:from-violet-700 hover:to-purple-700 transition-all"
                  >
                    <Sparkles size={12} />
                    {actionLabels[action] || action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Drawer */}
      {activeAction && (
        <ActionDrawer
          isOpen={true}
          onClose={() => setActiveAction(null)}
          actionType={activeAction}
          context={{
            userId: insight.entities.userId,
            locationId: insight.entities.locationId,
            vendorId: insight.entities.vendorId,
            timeImpactMinutes: insight.timeImpactMinutes,
          }}
        />
      )}

      {/* Invoice Drill-Down Modal */}
      <InvoiceDrillDownModal
        isOpen={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        title={`Invoices: ${insight.title}`}
        subtitle={`${sampleInvoices.length} invoices • Total: $${sampleInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`}
        invoices={sampleInvoices}
      />
    </>
  );
}

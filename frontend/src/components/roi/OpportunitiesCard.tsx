import { Target, Sparkles, BarChart2, CheckCircle, ExternalLink } from 'lucide-react';
import type { Opportunity, ROISummary, OpportunityAction } from '../../types';

interface OpportunitiesCardProps {
  opportunities: Opportunity[];
  summary: ROISummary;
  onActionClick: (action: OpportunityAction) => void;
}

interface OpportunityRowProps {
  opportunity: Opportunity;
  onActionClick: (action: OpportunityAction) => void;
}

function OpportunityRow({ opportunity, onActionClick }: OpportunityRowProps) {
  const opp = opportunity;

  return (
    <div className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 flex items-center justify-center">
            {opp.rank}
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-sm text-slate-900">{opp.entity_name}</span>
            <span className="text-slate-400 mx-1">—</span>
            <span className="text-sm text-slate-600">{opp.issue_summary}</span>
          </div>
        </div>
        <span className="text-sm font-semibold text-amber-600 whitespace-nowrap ml-2">~{opp.hours_weekly} hrs/wk</span>
      </div>

      {/* Details Row */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 ml-7">
        <span>{opp.invoices_affected} invoices affected</span>
        <span>·</span>
        <span>Root cause: {opp.root_cause}</span>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-3 ml-7">
        <button
          onClick={() => onActionClick(opp.action)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-md transition-shadow"
        >
          <Sparkles size={12} />
          {opp.action.label}
        </button>
        <span className="text-xs text-slate-400">← {opp.action.description}</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-emerald-600" />
        <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide">
          Top Opportunities
        </h3>
      </div>

      <div className="text-center py-8">
        <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
        <h4 className="font-semibold text-slate-700 mb-1">Great news!</h4>
        <p className="text-sm text-slate-500 mb-4">
          No major time sinks detected. Your edit rate is below company benchmark.
        </p>
        <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 mx-auto">
          View All Activity <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

export function OpportunitiesCard({ opportunities, summary, onActionClick }: OpportunitiesCardProps) {
  if (opportunities.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-emerald-600" />
          <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide">
            Top Opportunities
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Addressable</span>
          <div className="text-lg font-bold text-emerald-600">
            ~{summary.addressable_hours_weekly} hrs/week
          </div>
        </div>
      </div>

      {/* Opportunity Cards */}
      <div className="space-y-3">
        {opportunities.map(opp => (
          <OpportunityRow
            key={opp.id}
            opportunity={opp}
            onActionClick={onActionClick}
          />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
        <div className="flex items-center gap-2 text-sm">
          <BarChart2 size={14} className="text-slate-400" />
          <span className="text-slate-600">
            Fix all {opportunities.length}: Save <strong className="text-emerald-600">~{summary.addressable_hours_weekly} hrs/week</strong>
            {' '}· Edit rate {summary.current_edit_rate}% → {summary.projected_edit_rate}%
          </span>
        </div>
      </div>
    </div>
  );
}

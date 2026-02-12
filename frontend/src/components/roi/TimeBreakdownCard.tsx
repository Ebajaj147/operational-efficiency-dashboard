import { Clock, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import type { TimeBreakdown, TimeCategory } from '../../types';

interface TimeBreakdownCardProps {
  data: TimeBreakdown;
  onCategoryClick: (category: TimeCategory) => void;
  dateRangeLabel: string;
}

export function TimeBreakdownCard({ data, onCategoryClick, dateRangeLabel }: TimeBreakdownCardProps) {
  const isIncreasing = data.vs_previous_period >= 0;

  return (
    <div className="bg-slate-800 rounded-xl p-5 text-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
            Where Your Time Goes
          </h3>
        </div>
        <span className="text-xs text-slate-500">{dateRangeLabel}</span>
      </div>

      {/* Total */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{data.total_hours_weekly}</span>
          <span className="text-slate-400">hrs/week</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-sm flex items-center gap-1 ${isIncreasing ? 'text-red-400' : 'text-emerald-400'}`}>
            {isIncreasing ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(data.vs_previous_period)}% vs previous
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-sm text-slate-400">
            {Math.round(data.fte_equivalent * 100)}% FTE equivalent
          </span>
        </div>
      </div>

      {/* Segmented Bar */}
      <div className="h-3 rounded-full overflow-hidden flex mb-4">
        {data.categories.map(cat => (
          <div
            key={cat.id}
            className="h-full cursor-pointer hover:opacity-80 transition-opacity"
            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
            onClick={() => onCategoryClick(cat)}
            title={`${cat.name}: ${cat.hours_weekly} hrs`}
          />
        ))}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-4 gap-3">
        {data.categories.map(cat => (
          <button
            key={cat.id}
            className="text-left p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => onCategoryClick(cat)}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-slate-400 truncate">{cat.name}</span>
            </div>
            <div className="text-sm font-semibold">{cat.hours_weekly} hrs</div>
            <div className="text-xs text-slate-500">{cat.invoice_count} invoices</div>
          </button>
        ))}
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <button
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          onClick={() => onCategoryClick({ drilldown_filter: 'required_edit=true' } as TimeCategory)}
        >
          View All Edits <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

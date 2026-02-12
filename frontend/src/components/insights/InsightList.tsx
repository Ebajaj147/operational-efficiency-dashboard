import type { Insight } from '../../types';
import { InsightCard } from './InsightCard';

interface InsightListProps {
  insights: Insight[];
  limit?: number;
}

export function InsightList({ insights, limit }: InsightListProps) {
  const displayInsights = limit ? insights.slice(0, limit) : insights;

  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const warningCount = insights.filter(i => i.severity === 'warning').length;
  const opportunityCount = insights.filter(i => i.severity === 'opportunity').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">AI Insights</h3>
        <div className="flex gap-2 text-xs">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
              {warningCount} warning
            </span>
          )}
          {opportunityCount > 0 && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
              {opportunityCount} opportunity
            </span>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {displayInsights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
      {limit && insights.length > limit && (
        <button className="w-full mt-4 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
          View all {insights.length} insights
        </button>
      )}
    </div>
  );
}

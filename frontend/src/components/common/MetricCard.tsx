import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getTrendColor } from '../../utils/colors';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  lowerIsBetter?: boolean;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export function MetricCard({ title, value, trend, trendLabel, lowerIsBetter = false, icon, highlight = false }: MetricCardProps) {
  const trendColor = trend !== undefined ? getTrendColor(trend, lowerIsBetter) : '';

  const TrendIcon = () => {
    if (trend === undefined) return null;
    if (Math.abs(trend) < 1) return <Minus size={14} />;
    return trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
  };

  return (
    <div className={`rounded-xl border p-4 hover:shadow-lg transition-shadow ${
      highlight
        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-medium uppercase tracking-wide ${
          highlight ? 'text-emerald-700' : 'text-slate-500'
        }`}>{title}</span>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            highlight ? 'bg-emerald-200 text-emerald-700' : 'bg-blue-50 text-blue-600'
          }`}>
            {icon}
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold mb-1 ${
        highlight ? 'text-emerald-900' : 'text-slate-900'
      }`}>{value}</div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon />
          <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
          {trendLabel && <span className="text-slate-400 font-normal">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

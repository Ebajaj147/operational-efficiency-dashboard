import type { PerformanceCategory } from '../../types';
import { performanceColors } from '../../utils/colors';

interface PerformanceBadgeProps {
  category: PerformanceCategory;
}

export function PerformanceBadge({ category }: PerformanceBadgeProps) {
  const colors = performanceColors[category];

  return (
    <span className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1 ${colors.bg} ${colors.text}`}>
      {category}
    </span>
  );
}

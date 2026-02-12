import { getScoreColor } from '../../utils/colors';

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const colors = getScoreColor(score);

  return (
    <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
      {Math.round(score)}
    </span>
  );
}

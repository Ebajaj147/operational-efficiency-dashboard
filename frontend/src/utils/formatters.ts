export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDays(hours: number): string {
  const days = hours / 24;
  return `${days.toFixed(1)} days`;
}

export function formatTrend(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Time-based formatting helpers
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = minutes / 60;
  if (hours < 10) {
    return `${hours.toFixed(1)} hrs`;
  }
  return `${Math.round(hours)} hrs`;
}

export function formatHoursPerWeek(hours: number): string {
  if (hours < 1) {
    return `~${Math.round(hours * 60)} min/week`;
  }
  return `~${hours.toFixed(1)} hrs/week`;
}

export function formatFTE(hours: number): string {
  // FTE baseline: 2,080 hours/year = 40 hrs/week
  const fte = hours / 40;
  if (fte < 0.1) {
    return `${Math.round(fte * 100)}% FTE`;
  }
  return `${fte.toFixed(1)} FTE`;
}

export function formatTimeSavings(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min saved`;
  }
  const hours = minutes / 60;
  if (hours < 8) {
    return `${hours.toFixed(1)} hrs saved`;
  }
  return `~${Math.round(hours)} hrs saved`;
}

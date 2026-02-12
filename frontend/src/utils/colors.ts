import type { PerformanceCategory, InsightSeverity } from '../types';

export const performanceColors: Record<PerformanceCategory, { bg: string; text: string; hex: string }> = {
  'Exceptional': { bg: 'bg-emerald-100', text: 'text-emerald-700', hex: '#10b981' },
  'Above Average': { bg: 'bg-blue-100', text: 'text-blue-700', hex: '#3b82f6' },
  'Average': { bg: 'bg-purple-100', text: 'text-purple-700', hex: '#8b5cf6' },
  'Below Average': { bg: 'bg-amber-100', text: 'text-amber-700', hex: '#f59e0b' },
  'Needs Attention': { bg: 'bg-red-100', text: 'text-red-700', hex: '#ef4444' },
};

export const severityColors: Record<InsightSeverity, { bg: string; text: string; border: string; icon: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: 'text-red-500' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: 'text-amber-500' },
  opportunity: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: 'text-emerald-500' },
};

export function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 90) return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
  if (score >= 80) return { bg: 'bg-blue-100', text: 'text-blue-700' };
  if (score >= 70) return { bg: 'bg-amber-100', text: 'text-amber-700' };
  return { bg: 'bg-red-100', text: 'text-red-700' };
}

export function getScoreHex(score: number): string {
  if (score >= 90) return '#10b981';
  if (score >= 80) return '#3b82f6';
  if (score >= 70) return '#f59e0b';
  return '#ef4444';
}

export function getTrendColor(value: number, lowerIsBetter = false): string {
  const isGood = lowerIsBetter ? value < 0 : value > 0;
  if (Math.abs(value) < 1) return 'text-slate-500';
  return isGood ? 'text-emerald-600' : 'text-red-600';
}

export const chartColors = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4',
];

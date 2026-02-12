import { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';

interface LockedTabOverlayProps {
  tabName: string;
  onRequestAccess: () => void;
}

export function LockedTabOverlay({ tabName, onRequestAccess }: LockedTabOverlayProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    onRequestAccess();
  };

  return (
    <div className="relative">
      {/* Blurred background placeholder */}
      <div className="blur-sm opacity-50 pointer-events-none select-none">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-24">
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-6 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-64">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
            <div className="h-40 bg-slate-100 rounded" />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-64">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
            <div className="h-40 bg-slate-100 rounded" />
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-blue-600" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Unlock {tabName}
          </h2>

          <p className="text-sm text-slate-600 mb-6">
            Get detailed insights into {tabName.toLowerCase()} metrics, drill down into individual records,
            and discover AI-powered recommendations to optimize your AP operations.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleClick}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Sparkles size={18} />
              Request Full Access
            </button>

            <p className="text-xs text-slate-500">
              Contact your Ottimate representative to unlock premium features
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Premium features include: detailed drill-downs, AI insights,
              custom reports, and team benchmarking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

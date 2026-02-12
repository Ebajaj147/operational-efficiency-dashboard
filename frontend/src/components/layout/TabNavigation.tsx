import { LayoutDashboard, Users, MapPin, Building2, FileText, Lock } from 'lucide-react';
import type { TabId } from '../../types';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  lockedTabs?: TabId[];
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'staff', label: 'Staff Performance', icon: <Users size={18} /> },
  { id: 'locations', label: 'Locations', icon: <MapPin size={18} /> },
  { id: 'vendors', label: 'Vendors', icon: <Building2 size={18} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
];

export function TabNavigation({ activeTab, onTabChange, lockedTabs = [] }: TabNavigationProps) {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex gap-1">
          {tabs.map(tab => {
            const isLocked = lockedTabs.includes(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {isLocked && <Lock size={12} className="text-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

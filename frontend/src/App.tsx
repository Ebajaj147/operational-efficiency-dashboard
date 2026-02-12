import { useState } from 'react';
import type { TabId } from './types';
import { FilterProvider } from './context/FilterContext';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { FilterBar } from './components/layout/FilterBar';
import { Overview } from './pages/Overview';
import { StaffPerformance } from './pages/StaffPerformance';
import { Locations } from './pages/Locations';
import { Vendors } from './pages/Vendors';
import { Reports } from './pages/Reports';
import { LockedTabOverlay } from './components/common/LockedTabOverlay';

// Try-and-buy: These tabs start locked but can be unlocked for demo
const INITIAL_LOCKED_TABS: TabId[] = ['staff', 'locations', 'vendors', 'reports'];

const TAB_NAMES: Record<TabId, string> = {
  overview: 'Overview',
  staff: 'Staff Performance',
  locations: 'Locations',
  vendors: 'Vendors',
  reports: 'Reports',
};

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [unlockedTabs, setUnlockedTabs] = useState<TabId[]>([]);

  // Check if a tab is currently locked
  const isTabLocked = (tab: TabId) => {
    return INITIAL_LOCKED_TABS.includes(tab) && !unlockedTabs.includes(tab);
  };

  // Get list of currently locked tabs for navigation display
  const lockedTabs = INITIAL_LOCKED_TABS.filter(tab => !unlockedTabs.includes(tab));

  const handleRequestAccess = () => {
    // Demo mode: unlock the current tab when CTA is clicked
    if (!unlockedTabs.includes(activeTab)) {
      setUnlockedTabs([...unlockedTabs, activeTab]);
    }
  };

  const renderPage = () => {
    if (isTabLocked(activeTab)) {
      return (
        <LockedTabOverlay
          tabName={TAB_NAMES[activeTab]}
          onRequestAccess={handleRequestAccess}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'staff':
        return <StaffPerformance />;
      case 'locations':
        return <Locations />;
      case 'vendors':
        return <Vendors />;
      case 'reports':
        return <Reports />;
      default:
        return <Overview />;
    }
  };

  return (
    <FilterProvider>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} lockedTabs={lockedTabs} />
        <FilterBar />
        <main className="max-w-screen-2xl mx-auto px-6 py-6">
          {renderPage()}
        </main>
      </div>
    </FilterProvider>
  );
}

export default App;

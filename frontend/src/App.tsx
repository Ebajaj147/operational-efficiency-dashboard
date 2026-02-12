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

// Try-and-buy: These tabs are locked for free users
const LOCKED_TABS: TabId[] = ['staff', 'locations', 'vendors', 'reports'];

const TAB_NAMES: Record<TabId, string> = {
  overview: 'Overview',
  staff: 'Staff Performance',
  locations: 'Locations',
  vendors: 'Vendors',
  reports: 'Reports',
};

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const handleRequestAccess = () => {
    // In production, this would open a contact form or redirect to sales
    window.open('https://ottimate.com/contact', '_blank');
  };

  const renderPage = () => {
    const isLocked = LOCKED_TABS.includes(activeTab);

    if (isLocked) {
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
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} lockedTabs={LOCKED_TABS} />
        <FilterBar />
        <main className="max-w-screen-2xl mx-auto px-6 py-6">
          {renderPage()}
        </main>
      </div>
    </FilterProvider>
  );
}

export default App;

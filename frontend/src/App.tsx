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

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderPage = () => {
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
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <FilterBar />
        <main className="max-w-screen-2xl mx-auto px-6 py-6">
          {renderPage()}
        </main>
      </div>
    </FilterProvider>
  );
}

export default App;

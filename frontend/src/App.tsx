import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemoControls } from './components/DemoControls';
import { DashboardPage } from './pages/DashboardPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { AIAgentPage } from './pages/AIAgentPage';
import { CustomerRecoveryPage } from './pages/CustomerRecoveryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { SettingsPage } from './pages/SettingsPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  const isCustomerPage = location.pathname.startsWith('/recover/');

  if (isCustomerPage) {
    return (
      <Routes>
        <Route path="/recover/:transactionId" element={<CustomerRecoveryPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <div className="flex flex-1 min-w-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 pb-28">
          <Routes key={refreshKey}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/ai-agent" element={<AIAgentPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/audit" element={<AuditTrailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      <DemoControls onRefreshData={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { CustomersView } from './components/CustomersView.tsx';
import { DriversView } from './components/DriversView.tsx';
import { ShiftsView } from './components/ShiftsView.tsx';
import { DispatchView } from './components/DispatchView.tsx';
import { RoutesView } from './components/RoutesView.tsx';
import { TrackingView } from './components/TrackingView.tsx';
import { CommunicationView } from './components/CommunicationView.tsx';
import { FinanceView } from './components/FinanceView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { UsersView } from './components/UsersView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { SecurityTestSuiteView } from './components/SecurityTestSuiteView.tsx';
import { MasterDashboardView } from './components/MasterDashboardView.tsx';
import { Activity } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { loading, isMaster } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-2xl animate-pulse">
          D
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Activity className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>Iniciando ambiente multi-tenant DeliveryOS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'orders' && <OrdersView />}
          {activeTab === 'customers' && <CustomersView />}
          {activeTab === 'drivers' && <DriversView />}
          {activeTab === 'shifts' && <ShiftsView />}
          {activeTab === 'dispatch' && <DispatchView />}
          {activeTab === 'routes' && <RoutesView />}
          {activeTab === 'tracking' && <TrackingView />}
          {activeTab === 'communication' && <CommunicationView />}
          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'security_tests' && <SecurityTestSuiteView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'master' && (
            <MasterDashboardView onAccessStore={() => setActiveTab('dashboard')} />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

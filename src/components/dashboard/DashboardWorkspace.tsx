import { Suspense, lazy } from 'react';
import { useDashboardTabs, type DashboardTab } from './DashboardTabContext';

const AssetListPage      = lazy(() => import('../../pages/Assets/AssetListPage'));
const AssetDetailPage    = lazy(() => import('../../pages/Assets/AssetDetailPage'));
const SalesDashboard     = lazy(() => import('../../pages/Dashboard/SalesDashboard'));
const ManagerDashboard   = lazy(() => import('../../pages/Dashboard/ManagerDashboard'));
const EQCDashboard       = lazy(() => import('../../pages/Dashboard/EQCDashboard'));

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#706e6b' }}>
      <i
        className="fas fa-tools"
        style={{ fontSize: '32px', marginBottom: '14px', display: 'block', color: '#c0cfe0' }}
      />
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#3e3e3c' }}>{title}</div>
      <div style={{ fontSize: '13px', marginTop: '6px' }}>Coming soon</div>
    </div>
  );
}

function TabPanel({ tab }: { tab: DashboardTab }) {
  switch (tab.type) {
    case 'assets':
      return <AssetListPage />;
    case 'sales-field':
      return <SalesDashboard />;
    case 'asset-detail':
      return <AssetDetailPage asset={tab.payload} mode="view" />;
    case 'create-asset':
      return <AssetDetailPage mode="create" />;
    case 'demo-tracker':
      return <ComingSoon title="Demo Tracker Dashboard" />;
    case 'loaner-tracker':
      return <ComingSoon title="Loaner Tracker Dashboard" />;
    case 'manager-dashboard':
      return <div className="p-6"><ManagerDashboard /></div>;
    case 'eqc-dashboard':
      return <div className="p-6"><EQCDashboard /></div>;
    case 'dashboard':
      return null; // Home navigates to /dashboard route rather than rendering in a tab
    default:
      return null;
  }
}

export default function DashboardWorkspace() {
  const { tabs, activeTabId } = useDashboardTabs();

  return (
    <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'auto',
            display: tab.id === activeTabId ? 'block' : 'none',
          }}
        >
          <Suspense fallback={null}>
            <TabPanel tab={tab} />
          </Suspense>
        </div>
      ))}
    </div>
  );
}

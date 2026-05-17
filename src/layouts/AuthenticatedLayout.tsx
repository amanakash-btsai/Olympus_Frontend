import { Outlet } from 'react-router-dom';
import { DashboardTabProvider } from '@/components/dashboard/DashboardTabContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import '@/styles/globals.css';
import '@/styles/dashboard.css';

export default function AuthenticatedLayout() {
  return (
    <DashboardTabProvider>
      <div className="dashboard-root">
        <DashboardHeader />
        <DashboardNavbar />
        <div style={{ flex: 1, overflow: 'auto', background: '#f1f5f9' }}>
          <Outlet />
        </div>
      </div>
    </DashboardTabProvider>
  );
}

import DashboardTabs from '@/components/dashboard/DashboardTabs';
import DashboardWorkspace from '@/components/dashboard/DashboardWorkspace';

// 60px (DashboardHeader) + 46px (DashboardNavbar) = 106px of top chrome
const WORKSPACE_HEIGHT = 'calc(100vh - 106px)';

export default function AssetsWorkspacePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: WORKSPACE_HEIGHT, overflow: 'hidden' }}>
      <DashboardTabs />
      <DashboardWorkspace />
    </div>
  );
}

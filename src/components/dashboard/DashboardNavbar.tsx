import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDashboardTabs, type DashboardTabType } from './DashboardTabContext';

// ── REVERT GUIDE ────────────────────────────────────────────────────────────────
// To restore the original dropdown + section-only module tabs:
//   1. Restore the `import React` line (needed for handleSectionChange type)
//   2. Restore SECTION_ROUTES and SECTION_LABELS records (below, commented out)
//   3. Remove the dashboard entry from MODULES
//   4. Restore handleSectionChange and swap handleModuleClick back to original
//   5. In the JSX: restore the oly-dropdown block and the isAssetsSection ternary
// ────────────────────────────────────────────────────────────────────────────────

// ORIGINAL — kept for revert reference
// import React from 'react';
//
// const SECTION_ROUTES: Record<string, string> = {
//   dashboard:        '/dashboard',
//   assets:           '/assets',
//   'sales-requests': '/sales-requests',
//   'repair-cases':   '/repair-cases',
//   accounts:         '/accounts',
//   reports:          '/reports',
//   users:            '/users',
//   audit:            '/audit',
// };
//
// const SECTION_LABELS: Record<string, string> = {
//   dashboard:        'DASHBOARD',
//   assets:           'ASSETS',
//   'sales-requests': 'SALES REQUESTS',
//   'repair-cases':   'REPAIR CASES',
//   accounts:         'ACCOUNTS',
//   reports:          'REPORTS',
//   users:            'USERS',
//   audit:            'AUDIT LOG',
// };
//
// function currentSection(pathname: string): string {
//   if (pathname.startsWith('/dashboard'))      return 'dashboard';
//   if (pathname.startsWith('/assets'))         return 'assets';
//   if (pathname.startsWith('/sales-requests')) return 'sales-requests';
//   if (pathname.startsWith('/repair-cases'))   return 'repair-cases';
//   if (pathname.startsWith('/accounts'))       return 'accounts';
//   if (pathname.startsWith('/reports'))        return 'reports';
//   if (pathname.startsWith('/users'))          return 'users';
//   if (pathname.startsWith('/audit'))          return 'audit';
//   return 'dashboard';
// }

interface ModuleItem {
  id: string;
  type: DashboardTabType;
  title: string;
  icon: string;
  closable?: boolean;
}

// CHANGED: added dashboard as first module; original list started with assets
const MODULES: ModuleItem[] = [
  { id: 'dashboard',      type: 'dashboard',      title: 'Dashboard',      icon: 'fas fa-th-large',          closable: false },
  // CHANGED: closable was false — set to true to show × on the Assets sub-tab
  { id: 'assets',         type: 'assets',         title: 'Assets',         icon: 'fas fa-box-open',          closable: true  },
  { id: 'sales-field',    type: 'sales-field',     title: 'Sales Field',    icon: 'fas fa-clipboard-list',    closable: true  },
  { id: 'demo-tracker',   type: 'demo-tracker',    title: 'Demo Tracker',   icon: 'fas fa-chart-line',        closable: true  },
  { id: 'loaner-tracker', type: 'loaner-tracker',  title: 'Loaner Tracker', icon: 'fas fa-exchange-alt',      closable: true  },
];

function moduleForActiveTab(tabId: string): string {
  if (tabId === 'assets' || tabId.startsWith('asset-') || tabId === 'create-asset') return 'assets';
  if (tabId === 'sales-field')    return 'sales-field';
  if (tabId === 'demo-tracker')   return 'demo-tracker';
  if (tabId === 'loaner-tracker') return 'loaner-tracker';
  return tabId;
}

function brandLabelForPath(pathname: string): string {
  if (pathname.startsWith('/assets')) return 'ASSETS';
  return 'DASHBOARD';
}

export default function DashboardNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useCurrentUser();
  const { tabs, activeTabId, openTab } = useDashboardTabs();

  // CHANGED: brandLabel now derived without SECTION_LABELS map
  const brandLabel = brandLabelForPath(pathname);
  const isAssetsSection = pathname.startsWith('/assets');
  const isDashboardSection = pathname.startsWith('/dashboard');

  // CHANGED: dashboard button navigates; others open a tab (navigating to /assets first if needed)
  const handleModuleClick = (mod: ModuleItem) => {
    if (mod.id === 'dashboard') {
      navigate('/dashboard');
      return;
    }
    openTab({
      id: mod.id,
      type: mod.type,
      title: mod.title,
      closable: mod.closable,
    });
    if (!isAssetsSection) navigate('/assets');
  };

  // ORIGINAL handleModuleClick — kept for revert reference
  // const handleModuleClick = (mod: ModuleItem) => {
  //   openTab({ id: mod.id, type: mod.type, title: mod.title, closable: mod.closable });
  // };

  // ORIGINAL handleSectionChange — kept for revert reference
  // const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const route = SECTION_ROUTES[e.target.value];
  //   if (route) navigate(route);
  // };

  return (
    <div className="main-nav" id="mainNav">
      {/* CHANGED: module-nav-tabs moved before nav-brand so buttons appear on the left.
          ORIGINAL order was: nav-brand first, then module-nav-tabs. */}
      {/* CHANGED: module-nav-tabs now always visible (was gated on isAssetsSection).
          ORIGINAL conditional was:
            {isAssetsSection ? <div className="module-nav-tabs">…</div> : <div className="nav-tabs">…</div>}
      */}
      <div className="module-nav-tabs">
        {MODULES.map((mod) => {
          // Dashboard button is active when on /dashboard; others use tab-context
          const isActive =
            mod.id === 'dashboard'
              ? isDashboardSection
              : isAssetsSection && moduleForActiveTab(activeTabId) === mod.id;
          const isOpen =
            mod.id === 'dashboard'
              ? isDashboardSection
              : tabs.some(
                  (t) =>
                    t.id === mod.id ||
                    (t.id.startsWith('asset-') && mod.id === 'assets') ||
                    (t.id === 'create-asset' && mod.id === 'assets'),
                );
          return (
            <div
              key={mod.id}
              className={`module-nav-tab${isActive ? ' active' : ''}`}
              onClick={() => handleModuleClick(mod)}
              title={mod.title}
            >
              <i className={mod.icon} style={{ fontSize: '11px', opacity: isOpen ? 1 : 0.65 }} />
              <span>{mod.title}</span>
            </div>
          );
        })}
      </div>

      {/* ORIGINAL fallback nav-tabs for non-assets sections — kept for revert reference */}
      {/* <div className="nav-tabs">
            <div className="nav-tab-item active">
              <i className="fas fa-th-large" style={{ fontSize: '11px', opacity: 0.8 }} />
              <span className="tab-label">{brandLabel}</span>
            </div>
          </div> */}

      {/* CHANGED: nav-brand moved after module-nav-tabs (was before).
          marginLeft:'auto' pushes it to the right end.
          borderRight/paddingRight/marginRight cleared since it's no longer on the left.
          ORIGINAL position: first child of main-nav, with CSS border-right as separator.
          To revert: move this block before module-nav-tabs and remove the inline style. */}
      <div
        className="nav-brand"
        style={{ marginLeft: 'auto', borderRight: 'none', paddingRight: 0, marginRight: 0 }}
      >
        {/* CHANGED: hidden to declutter the nav bar. Remove display:'none' to restore. */}
        <div className="oly-logo-text2" style={{ display: 'none' }}>{brandLabel}</div>

        {/* ORIGINAL oly-dropdown — removed; replaced by Dashboard button in module-nav-tabs */}
        {/* <div className="oly-dropdown">
          <select value={section} onChange={handleSectionChange}>
            <option value="dashboard">Dashboard</option>
            <option value="assets">Assets</option>
            <option value="sales-requests">Sales Requests</option>
            <option value="repair-cases">Repair Cases</option>
            <option value="accounts">Accounts</option>
            <option value="reports">Reports</option>
            {user?.role === 'System_Admin' && <option value="users">Users</option>}
            {(user?.role === 'System_Admin' || user?.role === 'EQC_Manager' || user?.role === 'Sales_Manager' || user?.role === 'Executive') && (
              <option value="audit">Audit Log</option>
            )}
          </select>
        </div> */}

        <div className="oly-subtitle2">
          {user ? `${user.name} · ${user.role.replace(/_/g, ' ')}` : 'Dashboard'}
        </div>
      </div>
    </div>
  );
}

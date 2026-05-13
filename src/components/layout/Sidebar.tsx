import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Package, BoxSelect, Truck,
  ClipboardCheck, Wrench, BarChart2, Building2, Users, ScrollText,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import type { UserRole } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[] | null;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
  { path: '/sales-requests', label: 'Sales Requests', icon: ClipboardList, roles: null },
  { path: '/assets', label: 'Assets', icon: Package, roles: null },
  { path: '/bom', label: 'BOM & Packing', icon: BoxSelect, roles: ['EQC_Operator', 'EQC_Manager', 'System_Admin'] },
  { path: '/dispatch', label: 'Dispatch', icon: Truck, roles: ['EQC_Operator', 'EQC_Manager', 'System_Admin'] },
  { path: '/inspections', label: 'Inspections', icon: ClipboardCheck, roles: ['EQC_Operator', 'EQC_Manager', 'System_Admin'] },
  { path: '/repair-cases', label: 'Repair Cases', icon: Wrench, roles: ['FSE', 'EQC_Operator', 'EQC_Manager', 'Sales_Manager', 'System_Admin'] },
  { path: '/reports', label: 'Reports', icon: BarChart2, roles: null },
  { path: '/accounts', label: 'Accounts', icon: Building2, roles: ['Sales_Rep', 'FSE', 'EQC_Manager', 'Sales_Manager', 'System_Admin'] },
  { path: '/users', label: 'Users', icon: Users, roles: ['System_Admin'] },
  { path: '/audit', label: 'Audit Log', icon: ScrollText, roles: ['EQC_Manager', 'Sales_Manager', 'Executive', 'System_Admin'] },
];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useCurrentUser();
  const { logout } = useAuth();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles === null || item.roles.includes(user.role),
  );

  async function handleLogout() {
    await logout();
  }

  return (
    <aside
      className={`flex flex-col h-screen flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-[width] duration-200 ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 dark:border-gray-800 h-14">
        {!collapsed && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            EQC Platform
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex-shrink-0 ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'px-0 justify-center' : 'px-4'
              } ${
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {initials(user.name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role.replace(/_/g, ' ')}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 flex-shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

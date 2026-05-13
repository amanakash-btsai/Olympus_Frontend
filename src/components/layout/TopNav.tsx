import { useMatches } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface RouteHandle {
  breadcrumb?: string;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function TopNav() {
  const matches = useMatches();
  const user = useCurrentUser();

  const crumbs = matches
    .map((m) => (m.handle as RouteHandle | undefined)?.breadcrumb)
    .filter((b): b is string => Boolean(b));

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-gray-400" />}
            <span
              className={
                i === crumbs.length - 1
                  ? 'font-medium text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
            {user.name}
          </span>
        )}
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
          {user ? initials(user.name) : '?'}
        </div>
      </div>
    </header>
  );
}

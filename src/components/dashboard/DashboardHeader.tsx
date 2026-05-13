import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function DashboardHeader() {
  const [authOpen, setAuthOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClick = () => setAuthOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // logoutPopup may throw if cancelled; treat as success
    } finally {
      setIsLoggingOut(false);
      setAuthOpen(false);
    }
  }

  return (
    <div className="top-header">
      <div className="header-left">
        <div className="oly-logo">
          <span className="oly-logo-text">OLYMPUS</span>
          <div className="oly-logo-bar" />
        </div>
        <span className="oly-subtitle">Olympus Global Homepage</span>
      </div>

      <div className="header-center">
        <div className="header-search-pill">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
        </div>
      </div>

      <div className="header-right">
        <div className="lang-dropdown">
          <select defaultValue="en">
            <option value="en">English</option>
            <option value="th">ไทย (Thai)</option>
          </select>
        </div>
        <button className="globe-btn" aria-label="Select language">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <ellipse cx="12" cy="12" rx="4" ry="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="12" y1="2" x2="12" y2="22" />
            <path d="M4.93 4.93C6.58 6.58 9.17 7.5 12 7.5s5.42-.92 7.07-2.57" />
            <path d="M4.93 19.07C6.58 17.42 9.17 16.5 12 16.5s5.42.92 7.07 2.57" />
          </svg>
        </button>
        <div
          ref={dropdownRef}
          className={`auth-dropdown${authOpen ? ' open' : ''}`}
        >
          <button
            className="auth-btn"
            aria-haspopup="true"
            aria-expanded={authOpen}
            onClick={(e) => {
              e.stopPropagation();
              setAuthOpen((o) => !o);
            }}
          >
            <svg className="person-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
            </svg>
            {user ? initials(user.name) : 'Account'}
            <svg className="chevron-icon" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="auth-menu" role="menu">
            {user && (
              <>
                <div style={{ padding: '8px 14px', fontSize: '12px', color: '#888', pointerEvents: 'none' }}>
                  <div style={{ fontWeight: 600, color: '#333' }}>{user.name}</div>
                  <div>{user.email}</div>
                  <div style={{ marginTop: 2, textTransform: 'capitalize' }}>{user.role.replace(/_/g, ' ')}</div>
                </div>
                <hr />
              </>
            )}
            <a
              href="#"
              role="menuitem"
              className="signout"
              onClick={handleLogout}
              style={{ opacity: isLoggingOut ? 0.5 : 1 }}
            >
              {isLoggingOut ? 'Signing out…' : 'Sign Out'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

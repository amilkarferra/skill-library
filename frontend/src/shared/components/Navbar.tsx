import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, User, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { useNotificationsStore } from '../stores/useNotificationsStore';
import { AppLogo } from './AppLogo';
import './Navbar.css';

const ICON_SIZE_SMALL = 14;
const ICON_SIZE_MEDIUM = 16;
const LOGO_SIZE = 28;

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const pendingNotificationCount = useNotificationsStore(
    (state) => state.pendingNotificationCount
  );
  const hasPendingNotifications = pendingNotificationCount > 0;
  const isPanelPage =
    location.pathname.startsWith('/panel') ||
    location.pathname === '/settings';

  const exploreLinkClassName = buildNavbarLinkClass(!isPanelPage);
  const panelLinkClassName = buildNavbarLinkClass(isPanelPage);

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <div className="nav-wrapper">
      <nav className="nav">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <AppLogo size={LOGO_SIZE} />
            skill<span className="nav-logo-accent">library</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className={exploreLinkClassName}>
              Explore
            </Link>
            {isAuthenticated && (
              <Link to="/panel" className={panelLinkClassName}>
                My Panel
              </Link>
            )}
          </div>
        </div>
        <div className="nav-right">
          {isAuthenticated ? (
            <>
              <Link
                to="/publish"
                className="button button--primary button--small"
              >
                <Upload size={ICON_SIZE_SMALL} />
                Publish
              </Link>
              <div className="nav-profile">
                <User size={ICON_SIZE_MEDIUM} />
                <span className="nav-username">@{user?.username}</span>
                {hasPendingNotifications && (
                  <span className="nav-notification-dot" />
                )}
              </div>
              <button
                className="nav-logout"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={ICON_SIZE_SMALL} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="button button--primary button--small"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

function buildNavbarLinkClass(isActive: boolean): string {
  const baseClassName = 'nav-link';
  return isActive
    ? `${baseClassName} nav-link--active`
    : baseClassName;
}

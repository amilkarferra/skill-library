import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Upload, User, Box, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { useCatalogStore } from '../stores/useCatalogStore';
import { useNotificationsStore } from '../stores/useNotificationsStore';
import { AppLogo } from './AppLogo';
import './Navbar.css';

const ICON_SIZE_SMALL = 14;
const ICON_SIZE_MEDIUM = 16;
const LOGO_SIZE = 28;

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = useCatalogStore((state) => state.searchQuery);
  const setSearchQuery = useCatalogStore((state) => state.setSearchQuery);
  const pendingNotificationCount = useNotificationsStore(
    (state) => state.pendingNotificationCount
  );
  const hasPendingNotifications = pendingNotificationCount > 0;
  const isCatalogPage = location.pathname === '/';
  const isPanelPage =
    location.pathname.startsWith('/panel') ||
    location.pathname === '/settings';

  const handleSearchQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newQuery = event.target.value;
      setSearchQuery(newQuery);

      const isNotOnCatalogPage = location.pathname !== '/';
      if (isNotOnCatalogPage) {
        navigate('/');
      }
    },
    [setSearchQuery, location.pathname, navigate]
  );

  const exploreLinkClassName = buildNavbarLinkClass(!isPanelPage);
  const panelLinkClassName = buildNavbarLinkClass(isPanelPage);

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <AppLogo size={LOGO_SIZE} />
          skill<span className="nav-logo-accent">library</span>
        </Link>
        {isCatalogPage ? (
          <div className="nav-search">
            <Search size={ICON_SIZE_MEDIUM} className="nav-search-icon" />
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/" className={exploreLinkClassName}>
              <Search size={ICON_SIZE_SMALL} />
              Explore
            </Link>
            {isAuthenticated && (
              <Link to="/panel" className={panelLinkClassName}>
                <Box size={ICON_SIZE_SMALL} />
                My Panel
              </Link>
            )}
          </div>
        )}
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
              <div className="nav-profile-icon">
                <User size={ICON_SIZE_MEDIUM} />
                {hasPendingNotifications && (
                  <span className="nav-notification-dot" />
                )}
              </div>
              <div className="nav-profile-text">
                <span className="nav-profile-label">Signed in as</span>
                <span className="nav-username">@{user?.username}</span>
              </div>
              <button
                type="button"
                className="nav-logout"
                onClick={signOut}
                aria-label="Logout"
              >
                <LogOut size={ICON_SIZE_SMALL} />
              </button>
            </div>
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
  );
}

function buildNavbarLinkClass(isActive: boolean): string {
  const baseClassName = 'nav-link';
  return isActive
    ? `${baseClassName} nav-link--active`
    : baseClassName;
}

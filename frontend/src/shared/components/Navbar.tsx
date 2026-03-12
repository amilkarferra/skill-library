import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Upload, User, Box, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { useCatalogStore } from '../stores/useCatalogStore';
import { useNotificationsStore } from '../stores/useNotificationsStore';
import './Navbar.css';

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = useCatalogStore((state) => state.searchQuery);
  const setSearchQuery = useCatalogStore((state) => state.setSearchQuery);
  const pendingNotificationCount = useNotificationsStore((state) => state.pendingNotificationCount);
  const hasPendingNotifications = pendingNotificationCount > 0;
  const isCatalogPage = location.pathname === '/';
  const isPanelPage = location.pathname.startsWith('/panel') || location.pathname === '/settings';

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
          skill<span className="nav-logo-accent">library</span>
        </Link>
        {isCatalogPage ? (
          <div className="nav-search">
            <Search size={16} className="nav-search-icon" />
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
              <Search size={14} />
              Explore
            </Link>
            {isAuthenticated && (
              <Link to="/panel" className={panelLinkClassName}>
                <Box size={14} />
                My Panel
              </Link>
            )}
          </div>
        )}
      </div>
      <div className="nav-right">
        {isAuthenticated ? (
          <>
            <Link to="/publish" className="nav-publish-button">
              <Upload size={14} />
              Publish
            </Link>
            <div className="nav-profile">
              <div className="nav-profile-icon">
                <User size={16} />
                {hasPendingNotifications && <span className="nav-notification-dot" />}
              </div>
              <div className="nav-profile-text">
                <span className="nav-profile-label">Signed in as</span>
                <span className="nav-username">@{user?.username}</span>
              </div>
              <button className="nav-logout" onClick={signOut} aria-label="Logout">
                <LogOut size={14} />
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="nav-signin-link">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

function buildNavbarLinkClass(isActive: boolean): string {
  const baseClassName = 'nav-link';
  return isActive ? `${baseClassName} nav-link--active` : baseClassName;
}

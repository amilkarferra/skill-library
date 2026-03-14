import { useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Upload, User, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useNotificationsStore } from '../stores/useNotificationsStore';
import { AppLogo } from './AppLogo';
import { Button } from './Button';
import { AuthGuardDialog } from './AuthGuardDialog';
import './Navbar.css';

const ICON_SIZE_SMALL = 14;
const ICON_SIZE_MEDIUM = 16;
const LOGO_SIZE = 28;
const PUBLISH_LOGIN_MESSAGE = 'You need to sign in to publish skills. Would you like to sign in now?';

export function Navbar() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    guardWithLogin,
    loginDialogState,
    closeLoginDialog,
  } = useAuthGuard();
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

  const navigateToPublish = useCallback(() => navigate('/publish'), [navigate]);

  const handlePublishClick = useMemo(
    () => guardWithLogin({
      message: PUBLISH_LOGIN_MESSAGE,
      onAuthenticated: navigateToPublish,
    }),
    [guardWithLogin, navigateToPublish],
  );

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
          <Button
            variant="primary"
            size="small"
            onClick={handlePublishClick}
          >
            <Upload size={ICON_SIZE_SMALL} />
            Publish
          </Button>
          {isAuthenticated ? (
            <>
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
                disabled={isLoading}
                aria-label="Sign out"
                title="Sign out"
              >
                {isLoading
                  ? <span className="button-spinner" />
                  : <LogOut size={ICON_SIZE_SMALL} />
                }
              </button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="small"
              isLoading={isLoading}
              onClick={signIn}
            >
              Sign in
            </Button>
          )}
        </div>
      </nav>

      <AuthGuardDialog dialogState={loginDialogState} onClose={closeLoginDialog} />
    </div>
  );
}

function buildNavbarLinkClass(isActive: boolean): string {
  const baseClassName = 'nav-link';
  return isActive
    ? `${baseClassName} nav-link--active`
    : baseClassName;
}

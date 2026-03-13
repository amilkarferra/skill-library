import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { NotificationBanner } from '../../features/panel/NotificationBanner';
import { SessionExpiredBanner } from './SessionExpiredBanner';
import { useAuthStore } from '../stores/useAuthStore';
import './Layout.css';

export function Layout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="layout">
      <Navbar />
      <SessionExpiredBanner />
      {isAuthenticated && <NotificationBanner />}
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export function ProtectedLayout() {
  const { isAuthenticated, isSessionInitialized } = useAuthStore();

  const isSessionPending = !isSessionInitialized;
  if (isSessionPending) return null;

  const isNotAuthenticated = !isAuthenticated;
  if (isNotAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

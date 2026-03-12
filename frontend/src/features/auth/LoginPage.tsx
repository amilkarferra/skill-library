import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { AppLogo } from '../../shared/components/AppLogo';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { Button } from '../../shared/components/Button';
import './LoginPage.css';

export function LoginPage() {
  const { isAuthenticated, isLoading, authError, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const hasAuthError = authError !== null && authError !== undefined;
  const buttonLabel = isLoading ? 'Loading...' : 'Sign in with Microsoft';

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-badge">
          <AppLogo size={72} />
        </div>
        <h1 className="login-title">Skill Library</h1>
        <p className="login-subtitle">
          Share, discover, and download skills for Claude Code and Codex
        </p>

        {hasAuthError && (
          <AlertMessage variant="error">{authError}</AlertMessage>
        )}

        <Button
          variant="primary"
          size="large"
          isFullWidth
          onClick={signIn}
          disabled={isLoading}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

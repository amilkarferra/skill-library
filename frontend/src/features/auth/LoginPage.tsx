import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from 'lucide-react';
import { useAuth } from './useAuth';
import './LoginPage.css';

export function LoginPage() {
  const { isAuthenticated, isLoading, authError, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const isPageLoading = isLoading;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-badge">
          <Box size={18} />
        </div>
        <h1 className="login-title">Skill Library</h1>
        <p className="login-subtitle">
          Share, discover, and download skills for Claude Code and Codex
        </p>

        {authError && (
          <div className="login-error">{authError}</div>
        )}

        <button
          className="login-button"
          onClick={signIn}
          disabled={isPageLoading}
        >
          {isPageLoading ? 'Loading...' : 'Sign in with Microsoft'}
        </button>
      </div>
    </div>
  );
}

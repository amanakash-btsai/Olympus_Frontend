import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  async function handleLogin() {
    setIsLoggingIn(true);
    setError(null);
    try {
      await login();
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      // Ignore user-cancelled popup errors
      if (!message.toLowerCase().includes('cancel') && !message.toLowerCase().includes('closed')) {
        setError(message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-lg text-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">EQC Asset Management</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in with your Olympus AD account</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoggingIn || isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingIn || isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {isLoading ? 'Loading…' : 'Signing in…'}
            </>
          ) : (
            'Sign in with Olympus AD'
          )}
        </button>
      </div>
    </div>
  );
}

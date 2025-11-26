import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onSwitch: () => void;
  onSuccess?: () => void;
}

export function LoginForm({ onSwitch, onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-[var(--theme-text)] mb-1">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-[var(--theme-text)] mb-1">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-[var(--theme-primary)] text-white font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-sm text-center text-[var(--theme-text-muted)]">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[var(--theme-primary)] hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}

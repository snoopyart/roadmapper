import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
  onSwitch: () => void;
  onSuccess?: () => void;
}

export function RegisterForm({ onSwitch, onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(email, password, name || undefined);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-[var(--theme-text)] mb-1">
          Name <span className="text-[var(--theme-text-muted)]">(optional)</span>
        </label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-[var(--theme-text)] mb-1">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-[var(--theme-text)] mb-1">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
          placeholder="At least 8 characters"
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
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-sm text-center text-[var(--theme-text-muted)]">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[var(--theme-primary)] hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

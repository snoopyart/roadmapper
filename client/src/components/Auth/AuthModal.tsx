import { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 id="auth-modal-title" className="text-xl font-semibold text-[var(--theme-text)]">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {mode === 'login' ? (
          <LoginForm
            onSwitch={() => setMode('register')}
            onSuccess={onClose}
          />
        ) : (
          <RegisterForm
            onSwitch={() => setMode('login')}
            onSuccess={onClose}
          />
        )}
      </div>
    </div>
  );
}

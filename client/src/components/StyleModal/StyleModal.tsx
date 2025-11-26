import { useEffect, useRef } from 'react';
import { ThemeSelector } from '../StylePanel/ThemeSelector';
import { LayoutOptions } from '../StylePanel/LayoutOptions';

interface StyleModalProps {
  onClose: () => void;
}

export function StyleModal({ onClose }: StyleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="style-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--theme-border)]">
          <h2 id="style-modal-title" className="text-lg font-semibold text-[var(--theme-text)]">
            Styling Options
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-[var(--theme-text)] mb-3">Theme</h3>
            <ThemeSelector />
          </div>

          <div className="border-t border-[var(--theme-border)] pt-6">
            <h3 className="text-sm font-medium text-[var(--theme-text)] mb-3">Layout</h3>
            <LayoutOptions />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--theme-border)] bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] rounded-md hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ThemeSelector } from './ThemeSelector';
import { LayoutOptions } from './LayoutOptions';
import { CustomColors } from './CustomColors';

export function StylePanel() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-t border-[var(--theme-border)] bg-[var(--theme-surface)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-[var(--theme-text)]">Styling Options</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[var(--theme-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          <ThemeSelector />
          <CustomColors />
          <div className="border-t border-[var(--theme-border)] pt-4">
            <LayoutOptions />
          </div>
        </div>
      )}
    </div>
  );
}

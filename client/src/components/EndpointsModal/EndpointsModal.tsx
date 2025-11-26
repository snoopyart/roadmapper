import { useState, useEffect, useRef } from 'react';
import { useRoadmap } from '../../hooks/useRoadmap';

const DEFAULT_START_COLOR = '#06b6d4'; // teal (theme-secondary)
const DEFAULT_END_COLOR = '#8b5cf6'; // purple (theme-accent)

interface EndpointsModalProps {
  onClose: () => void;
}

export function EndpointsModal({ onClose }: EndpointsModalProps) {
  const { endpoints, setEndpoints } = useRoadmap();
  const [start, setStart] = useState(endpoints?.start || '');
  const [end, setEnd] = useState(endpoints?.end || '');
  const [startColor, setStartColor] = useState(endpoints?.startColor || DEFAULT_START_COLOR);
  const [endColor, setEndColor] = useState(endpoints?.endColor || DEFAULT_END_COLOR);
  const startInputRef = useRef<HTMLInputElement>(null);

  // Focus the first input on mount
  useEffect(() => {
    startInputRef.current?.focus();
  }, []);

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

  const handleSave = () => {
    setEndpoints({
      start: start.trim(),
      end: end.trim(),
      startColor,
      endColor,
    });
    onClose();
  };

  const handleClear = () => {
    setStart('');
    setEnd('');
    setStartColor(DEFAULT_START_COLOR);
    setEndColor(DEFAULT_END_COLOR);
    setEndpoints({ start: '', end: '', startColor: DEFAULT_START_COLOR, endColor: DEFAULT_END_COLOR });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="endpoints-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--theme-border)]">
          <h2 id="endpoints-modal-title" className="text-lg font-semibold text-[var(--theme-text)]">
            Timeline Endpoints
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
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--theme-text-muted)]">
            Add optional labels for the start and end of your timeline. Leave empty to hide.
          </p>

          <div>
            <label htmlFor="start-label" className="block text-sm font-medium text-[var(--theme-text)] mb-1">
              Start Point
            </label>
            <div className="flex gap-2">
              <input
                ref={startInputRef}
                id="start-label"
                type="text"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="e.g., Project Start, Today, Q1 2025"
                className="flex-1 px-3 py-2 border border-[var(--theme-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
              />
              <input
                type="color"
                value={startColor}
                onChange={(e) => setStartColor(e.target.value)}
                className="w-10 h-10 rounded-md border border-[var(--theme-border)] cursor-pointer p-1"
                title="Start point color"
              />
            </div>
          </div>

          <div>
            <label htmlFor="end-label" className="block text-sm font-medium text-[var(--theme-text)] mb-1">
              End Point
            </label>
            <div className="flex gap-2">
              <input
                id="end-label"
                type="text"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="e.g., Launch, Goal, Q4 2025"
                className="flex-1 px-3 py-2 border border-[var(--theme-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
              />
              <input
                type="color"
                value={endColor}
                onChange={(e) => setEndColor(e.target.value)}
                className="w-10 h-10 rounded-md border border-[var(--theme-border)] cursor-pointer p-1"
                title="End point color"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--theme-border)] bg-gray-50 rounded-b-lg flex justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
          >
            Clear Both
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--theme-text)] bg-white border border-[var(--theme-border)] rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] rounded-md hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

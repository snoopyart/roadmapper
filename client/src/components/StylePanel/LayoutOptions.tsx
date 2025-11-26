import { useRoadmap } from '../../hooks/useRoadmap';
import type { Orientation, FontSize, EntryShape } from '../../types';

export function LayoutOptions() {
  const { orientation, fontSize, entryShape, setOrientation, setFontSize, setEntryShape } = useRoadmap();

  return (
    <div className="space-y-4">
      {/* Orientation */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Orientation
        </label>
        <div className="flex gap-2">
          {(['horizontal', 'vertical'] as Orientation[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setOrientation(opt)}
              className={`
                flex-1 px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors
                ${orientation === opt
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-gray-50'
                }
              `}
              aria-pressed={orientation === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Font Size
        </label>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setFontSize(size)}
              className={`
                flex-1 px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors
                ${fontSize === size
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-gray-50'
                }
              `}
              aria-pressed={fontSize === size}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Entry Shape */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Entry Style
        </label>
        <div className="flex gap-2">
          {(['rounded', 'square', 'minimal'] as EntryShape[]).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => setEntryShape(shape)}
              className={`
                flex-1 px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors
                ${entryShape === shape
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-gray-50'
                }
              `}
              aria-pressed={entryShape === shape}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

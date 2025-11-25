import { themes } from '../../themes';
import { useRoadmap } from '../../hooks/useRoadmap';

export function ThemeSelector() {
  const { themeId, setTheme } = useRoadmap();

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
        Color Theme
      </label>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => setTheme(theme.id)}
            className={`
              p-2 rounded-lg border-2 transition-all text-left
              ${themeId === theme.id
                ? 'border-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)] ring-opacity-30'
                : 'border-[var(--theme-border)] hover:border-gray-300'
              }
            `}
            aria-label={`Select ${theme.name} theme`}
            aria-pressed={themeId === theme.id}
          >
            <div className="flex gap-1 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.colors.secondary }}
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.colors.accent }}
              />
            </div>
            <span className="text-xs font-medium text-[var(--theme-text)]">
              {theme.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

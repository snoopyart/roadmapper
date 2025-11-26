import { useState, useEffect } from 'react';
import { useRoadmap } from '../../hooks/useRoadmap';
import { getThemeById } from '../../themes';
import type { CustomColors as CustomColorsType } from '../../types';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  const [hexValue, setHexValue] = useState(value);

  useEffect(() => {
    setHexValue(value);
  }, [value]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHexValue(newValue);
    // Only apply if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleHexBlur = () => {
    // Reset to current value if invalid
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      setHexValue(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-[var(--theme-border)] cursor-pointer p-0.5"
        title={label}
      />
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-[var(--theme-text-muted)] mb-0.5 truncate">
          {label}
        </label>
        <input
          type="text"
          value={hexValue}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          placeholder="#000000"
          className="w-full px-2 py-1 text-xs border border-[var(--theme-border)] rounded bg-[var(--theme-surface)] text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
        />
      </div>
    </div>
  );
}

export function CustomColors() {
  const { themeId, customColors, setCustomColors } = useRoadmap();
  const [isExpanded, setIsExpanded] = useState(false);
  const baseTheme = getThemeById(themeId);

  // Initialize colors from custom colors or theme
  const currentColors: CustomColorsType = customColors || baseTheme.colors;

  const handleColorChange = (key: keyof CustomColorsType, value: string) => {
    setCustomColors({
      ...currentColors,
      [key]: value,
    });
  };

  const handleReset = () => {
    setCustomColors(undefined);
  };

  const hasCustomColors = customColors !== undefined;

  const colorFields: { key: keyof CustomColorsType; label: string }[] = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'background', label: 'Background' },
    { key: 'surface', label: 'Surface' },
    { key: 'text', label: 'Text' },
    { key: 'textMuted', label: 'Text Muted' },
    { key: 'border', label: 'Border' },
  ];

  return (
    <div className="border-t border-[var(--theme-border)] pt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-[var(--theme-text)]">
          Custom Colors
        </span>
        <div className="flex items-center gap-2">
          {hasCustomColors && (
            <span className="text-xs text-[var(--theme-primary)] font-medium">
              Active
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[var(--theme-text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-[var(--theme-text-muted)]">
            Customize individual colors. Changes override the selected theme.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {colorFields.map(({ key, label }) => (
              <ColorInput
                key={key}
                label={label}
                value={currentColors[key]}
                onChange={(value) => handleColorChange(key, value)}
              />
            ))}
          </div>

          {hasCustomColors && (
            <button
              type="button"
              onClick={handleReset}
              className="w-full px-3 py-2 text-sm font-medium text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)] rounded-md hover:bg-gray-50 transition-colors"
            >
              Reset to Theme Colors
            </button>
          )}
        </div>
      )}
    </div>
  );
}

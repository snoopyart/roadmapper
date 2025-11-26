import { useRoadmap } from '../../hooks/useRoadmap';
import { fontFamilyNames, fontFamilies } from '../../themes';
import type { Orientation, FontSize, EntryShape, FontFamily, LineStyle, LineThickness } from '../../types';

export function LayoutOptions() {
  const {
    orientation,
    fontSize,
    entryShape,
    fontFamily,
    lineStyle,
    lineThickness,
    setOrientation,
    setFontSize,
    setEntryShape,
    setFontFamily,
    setLineStyle,
    setLineThickness,
  } = useRoadmap();

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
        <div className="grid grid-cols-2 gap-2">
          {(['rounded', 'square', 'minimal', 'ghost'] as EntryShape[]).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => setEntryShape(shape)}
              className={`
                px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors
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

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Font Family
        </label>
        <div className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto border border-[var(--theme-border)] rounded-md p-1 bg-[var(--theme-surface)]">
          {(Object.keys(fontFamilyNames) as FontFamily[]).map((family) => (
            <button
              key={family}
              type="button"
              onClick={() => setFontFamily(family)}
              className={`
                w-full px-3 py-2 rounded text-left text-sm transition-colors
                ${fontFamily === family
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'text-[var(--theme-text)] hover:bg-gray-100'
                }
              `}
              style={{ fontFamily: fontFamilies[family] }}
              aria-pressed={fontFamily === family}
            >
              {fontFamilyNames[family]}
            </button>
          ))}
        </div>
      </div>

      {/* Line Style */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Line Style
        </label>
        <div className="flex gap-2">
          {(['solid', 'dashed', 'dotted'] as LineStyle[]).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setLineStyle(style)}
              className={`
                flex-1 px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors
                ${lineStyle === style
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-gray-50'
                }
              `}
              aria-pressed={lineStyle === style}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Line Thickness */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Line Thickness
        </label>
        <div className="flex gap-2">
          {(['thin', 'medium', 'thick'] as LineThickness[]).map((thickness) => (
            <button
              key={thickness}
              type="button"
              onClick={() => setLineThickness(thickness)}
              className={`
                flex-1 px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors
                ${lineThickness === thickness
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-gray-50'
                }
              `}
              aria-pressed={lineThickness === thickness}
            >
              {thickness}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

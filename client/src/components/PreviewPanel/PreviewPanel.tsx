import { useRoadmap } from '../../hooks/useRoadmap';
import { Timeline } from './Timeline';
import { ExportButton } from './ExportButton';

export function PreviewPanel() {
  const { title, entries, orientation, fontSize, entryShape } = useRoadmap();

  return (
    <div className="h-full flex flex-col bg-[var(--theme-background)]">
      <div className="p-4 border-b border-[var(--theme-border)] bg-[var(--theme-surface)] flex items-center justify-between no-print">
        <div>
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">Preview</h2>
          <p className="text-sm text-[var(--theme-text-muted)]">
            Live preview of your roadmap
          </p>
        </div>

        <ExportButton />
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div
          className="mx-auto max-w-[1200px] min-h-[400px] bg-white p-6 rounded-lg"
          id="roadmap-preview"
        >
          {title && (
            <h1 className="text-2xl font-bold text-[var(--theme-text)] mb-6 text-center">
              {title}
            </h1>
          )}
          <Timeline
            entries={entries}
            orientation={orientation}
            fontSize={fontSize}
            entryShape={entryShape}
          />
        </div>
      </div>
    </div>
  );
}

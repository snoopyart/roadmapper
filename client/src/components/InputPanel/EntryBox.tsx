import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TimelineEntry } from '../../types';
import { DragHandle } from './DragHandle';
import { DateInput } from './DateInput';
import { MarkdownEditor } from './MarkdownEditor';

interface EntryBoxProps {
  entry: TimelineEntry;
  index: number;
  totalEntries: number;
  onUpdate: (id: string, updates: Partial<TimelineEntry>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export const EntryBox = memo(function EntryBox({
  entry,
  index,
  totalEntries,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: EntryBoxProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const canMoveUp = index > 0;
  const canMoveDown = index < totalEntries - 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-[var(--theme-border)] rounded-lg p-4 shadow-sm ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      role="listitem"
      aria-label={`Entry ${index + 1}: ${entry.title || 'Untitled'}`}
    >
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1">
          <DragHandle attributes={attributes} listeners={listeners} />
          {/* Keyboard reorder buttons */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => onMoveUp(entry.id)}
              disabled={!canMoveUp}
              className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100"
              aria-label="Move entry up"
              title="Move up"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(entry.id)}
              disabled={!canMoveDown}
              className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100"
              aria-label="Move entry down"
              title="Move down"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <label
              htmlFor={`title-${entry.id}`}
              className="block text-sm font-medium text-[var(--theme-text)] mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id={`title-${entry.id}`}
              type="text"
              value={entry.title}
              onChange={(e) => onUpdate(entry.id, { title: e.target.value })}
              placeholder="Enter title..."
              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`description-${entry.id}`}
              className="block text-sm font-medium text-[var(--theme-text)] mb-1"
            >
              Description
            </label>
            <MarkdownEditor
              id={`description-${entry.id}`}
              value={entry.description || ''}
              onChange={(description) => onUpdate(entry.id, { description })}
              placeholder="Optional description (supports markdown)..."
              rows={2}
            />
          </div>

          <div>
            <label
              htmlFor={`date-${entry.id}`}
              className="block text-sm font-medium text-[var(--theme-text)] mb-1"
            >
              Date
            </label>
            <DateInput
              id={`date-${entry.id}`}
              value={entry.date || ''}
              onChange={(date) => onUpdate(entry.id, { date })}
            />
            <p className="mt-1 text-xs text-[var(--theme-text-muted)]">
              Type or use picker for Year, Month/Year, or full date
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          aria-label="Delete entry"
        >
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
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
});

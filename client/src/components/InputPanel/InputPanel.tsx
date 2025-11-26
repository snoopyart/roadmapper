import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useRoadmap } from '../../hooks/useRoadmap';
import { EntryBox } from './EntryBox';

export function InputPanel() {
  const { entries, title, setTitle, addEntry, deleteEntry, updateEntry, reorderEntries } = useRoadmap();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex((e) => e.id === active.id);
      const newIndex = entries.findIndex((e) => e.id === over.id);
      const newEntries = arrayMove(entries, oldIndex, newIndex);
      reorderEntries(newEntries);
    }
  };

  const handleMoveUp = useCallback(
    (id: string) => {
      const index = entries.findIndex((e) => e.id === id);
      if (index > 0) {
        const newEntries = arrayMove(entries, index, index - 1);
        reorderEntries(newEntries);
      }
    },
    [entries, reorderEntries]
  );

  const handleMoveDown = useCallback(
    (id: string) => {
      const index = entries.findIndex((e) => e.id === id);
      if (index < entries.length - 1) {
        const newEntries = arrayMove(entries, index, index + 1);
        reorderEntries(newEntries);
      }
    },
    [entries, reorderEntries]
  );

  return (
    <div className="h-full flex flex-col bg-[var(--theme-background)]">
      <div className="p-4 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]">
        <label htmlFor="roadmap-title" className="block text-sm font-medium text-[var(--theme-text)] mb-1">
          Roadmap Title
        </label>
        <input
          id="roadmap-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter roadmap title..."
          className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
        />
      </div>

      <div className="p-4 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]">
        <h2 className="text-lg font-semibold text-[var(--theme-text)]">Timeline Entries</h2>
        <p className="text-sm text-[var(--theme-text-muted)]">
          Add and arrange your roadmap items
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={entries} strategy={verticalListSortingStrategy}>
            <div className="space-y-3" role="list" aria-label="Timeline entries">
              {entries.map((entry, index) => (
                <EntryBox
                  key={entry.id}
                  entry={entry}
                  index={index}
                  totalEntries={entries.length}
                  onUpdate={updateEntry}
                  onDelete={deleteEntry}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {entries.length === 0 && (
          <div className="text-center py-8 text-[var(--theme-text-muted)]">
            <p>No entries yet. Add your first timeline item!</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-surface)]">
        <button
          type="button"
          onClick={() => addEntry()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--theme-primary)] text-white rounded-md hover:opacity-90 transition-opacity font-medium"
          aria-label="Add new timeline entry"
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Entry
        </button>
      </div>
    </div>
  );
}

import { memo } from 'react';
import type { TimelineEntry, EntryShape, FontSize } from '../../types';

interface TimelineItemProps {
  entry: TimelineEntry;
  shape: EntryShape;
  fontSize: FontSize;
  isHorizontal: boolean;
}

const fontSizeClasses: Record<FontSize, { title: string; desc: string; date: string }> = {
  small: { title: 'text-sm', desc: 'text-xs', date: 'text-xs' },
  medium: { title: 'text-base', desc: 'text-sm', date: 'text-sm' },
  large: { title: 'text-lg', desc: 'text-base', date: 'text-base' },
};

const shapeClasses: Record<EntryShape, string> = {
  rounded: 'rounded-xl',
  square: 'rounded-none',
  minimal: 'rounded-md border-l-4 border-t-0 border-r-0 border-b-0',
  ghost: 'rounded-md',
};

export const TimelineItem = memo(function TimelineItem({ entry, shape, fontSize, isHorizontal }: TimelineItemProps) {
  const fonts = fontSizeClasses[fontSize];
  const shapeClass = shapeClasses[shape];
  const hasDescription = entry.description && entry.description.trim().length > 0;
  const hasDate = entry.date && entry.date.trim().length > 0;

  const isGhost = shape === 'ghost';

  return (
    <div
      className={`
        p-4
        ${shapeClass}
        ${isGhost
          ? 'bg-[var(--theme-surface)] border-none shadow-none'
          : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm'
        }
        ${shape === 'minimal' ? 'border-l-[var(--theme-primary)]' : ''}
        ${isHorizontal ? 'min-w-[150px] max-w-[200px] flex-shrink-0' : 'w-full'}
      `}
    >
      <h3 className={`font-semibold text-[var(--theme-text)] ${fonts.title}`}>
        {entry.title || 'Untitled'}
      </h3>

      {hasDescription && (
        <p className={`mt-1 text-[var(--theme-text-muted)] ${fonts.desc}`}>
          {entry.description}
        </p>
      )}

      {hasDate && (
        <p className={`mt-2 text-[var(--theme-primary)] font-medium ${fonts.date}`}>
          {entry.date}
        </p>
      )}
    </div>
  );
});

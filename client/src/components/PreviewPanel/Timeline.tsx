import { useRef, useEffect, useState } from 'react';
import type { TimelineEntry, Orientation, FontSize, EntryShape, Endpoints } from '../../types';
import { TimelineItem } from './TimelineItem';

const DEFAULT_START_COLOR = '#06b6d4'; // teal
const DEFAULT_END_COLOR = '#8b5cf6'; // purple

interface TimelineProps {
  entries: TimelineEntry[];
  orientation: Orientation;
  fontSize: FontSize;
  entryShape: EntryShape;
  endpoints?: Endpoints;
}

export function Timeline({ entries, orientation, fontSize, entryShape, endpoints }: TimelineProps) {
  const isHorizontal = orientation === 'horizontal';
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const hasStartPoint = endpoints?.start && endpoints.start.trim() !== '';
  const hasEndPoint = endpoints?.end && endpoints.end.trim() !== '';
  const startColor = endpoints?.startColor || DEFAULT_START_COLOR;
  const endColor = endpoints?.endColor || DEFAULT_END_COLOR;

  // Auto-scale to fit container without horizontal scroll
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !contentRef.current || !isHorizontal) {
        setScale(1);
        return;
      }

      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.scrollWidth;

      if (contentWidth > containerWidth) {
        const newScale = Math.max(0.5, containerWidth / contentWidth);
        setScale(newScale);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [entries, isHorizontal, fontSize]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--theme-text-muted)]">
        <p>Add some entries to see your roadmap</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <div
        ref={contentRef}
        className="relative origin-top-left transition-transform duration-200"
        style={{ transform: isHorizontal ? `scale(${scale})` : undefined }}
      >
        {/* Timeline line */}
        <div
          className={`
            absolute bg-[var(--theme-primary)] opacity-30
            ${isHorizontal
              ? 'left-0 right-0 top-1/2 h-1 -translate-y-1/2'
              : 'top-0 bottom-0 left-8 w-1'
            }
          `}
        />

        {/* Timeline items */}
        <div
          className={`
            relative
            ${isHorizontal
              ? 'flex flex-row gap-4 pb-4 pt-14 items-start'
              : 'flex flex-col gap-4 pl-14'
            }
          `}
        >
          {/* Start Point */}
          {hasStartPoint && (
            <div className={`relative flex-shrink-0 ${isHorizontal ? 'self-center -mt-14 z-10' : ''}`}>
              {/* Only show dot in vertical mode */}
              {!isHorizontal && (
                <div
                  className="absolute w-4 h-4 rounded-full border-2 border-[var(--theme-surface)] z-10 -left-8 top-1/2 -translate-y-1/2"
                  style={{ backgroundColor: startColor }}
                />
              )}
              <div
                className={`
                  px-3 py-2 rounded-lg border text-sm font-medium
                  ${isHorizontal ? 'text-center min-w-[80px] text-white' : 'text-[var(--theme-text)]'}
                `}
                style={
                  isHorizontal
                    ? { backgroundColor: startColor, borderColor: startColor }
                    : { backgroundColor: `${startColor}15`, borderColor: `${startColor}50` }
                }
              >
                {endpoints?.start}
              </div>
            </div>
          )}

          {entries.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Connector dot */}
              <div
                className={`
                  absolute w-3 h-3 rounded-full bg-[var(--theme-primary)] border-2 border-[var(--theme-surface)] z-10
                  ${isHorizontal
                    ? 'left-1/2 -translate-x-1/2 -top-6'
                    : '-left-7 top-4'
                  }
                `}
              />

              {/* Item number badge */}
              <div
                className={`
                  absolute bg-[var(--theme-primary)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10
                  ${isHorizontal
                    ? 'left-1/2 -translate-x-1/2 -top-12'
                    : '-left-12 top-3'
                  }
                `}
              >
                {index + 1}
              </div>

              <TimelineItem
                entry={entry}
                shape={entryShape}
                fontSize={fontSize}
                isHorizontal={isHorizontal}
              />
            </div>
          ))}

          {/* End Point */}
          {hasEndPoint && (
            <div className={`relative flex-shrink-0 ${isHorizontal ? 'self-center -mt-14 z-10' : ''}`}>
              {/* Only show dot in vertical mode */}
              {!isHorizontal && (
                <div
                  className="absolute w-4 h-4 rounded-full border-2 border-[var(--theme-surface)] z-10 -left-8 top-1/2 -translate-y-1/2"
                  style={{ backgroundColor: endColor }}
                />
              )}
              <div
                className={`
                  px-3 py-2 rounded-lg border text-sm font-medium
                  ${isHorizontal ? 'text-center min-w-[80px] text-white' : 'text-[var(--theme-text)]'}
                `}
                style={
                  isHorizontal
                    ? { backgroundColor: endColor, borderColor: endColor }
                    : { backgroundColor: `${endColor}15`, borderColor: `${endColor}50` }
                }
              >
                {endpoints?.end}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

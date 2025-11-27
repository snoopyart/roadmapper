import { useRef, useEffect, useState } from 'react';
import type { TimelineEntry, Orientation, FontSize, EntryShape, Endpoints, LineStyle, LineThickness, EndpointStyle } from '../../types';
import { TimelineItem } from './TimelineItem';

const DEFAULT_START_COLOR = '#06b6d4'; // teal
const DEFAULT_END_COLOR = '#8b5cf6'; // purple

// Endpoint marker component
function EndpointMarker({ style, color, direction, isHorizontal }: {
  style: EndpointStyle;
  color: string;
  direction: 'start' | 'end';
  isHorizontal: boolean;
}) {
  if (style === 'none') return null;

  const size = 16;

  // For arrows, we need to rotate based on direction and orientation
  const getArrowRotation = () => {
    if (isHorizontal) {
      return direction === 'start' ? 0 : 180; // left-pointing for start, right-pointing for end
    }
    return direction === 'start' ? 90 : 270; // up-pointing for start, down-pointing for end
  };

  switch (style) {
    case 'dot':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" className="flex-shrink-0">
          <circle cx="8" cy="8" r="6" fill={color} />
        </svg>
      );
    case 'arrow':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          className="flex-shrink-0"
          style={{ transform: `rotate(${getArrowRotation()}deg)` }}
        >
          <polygon points="2,8 14,3 14,13" fill={color} />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" className="flex-shrink-0">
          <polygon points="8,1 15,8 8,15 1,8" fill={color} />
        </svg>
      );
    case 'square':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" className="flex-shrink-0">
          <rect x="2" y="2" width="12" height="12" fill={color} />
        </svg>
      );
    default:
      return null;
  }
}

interface TimelineProps {
  entries: TimelineEntry[];
  orientation: Orientation;
  fontSize: FontSize;
  entryShape: EntryShape;
  endpoints?: Endpoints;
  lineStyle?: LineStyle;
  lineThickness?: LineThickness;
}

const lineThicknessValues: Record<LineThickness, string> = {
  thin: '2px',
  medium: '4px',
  thick: '6px',
};

export function Timeline({ entries, orientation, fontSize, entryShape, endpoints, lineStyle = 'solid', lineThickness = 'medium' }: TimelineProps) {
  const isHorizontal = orientation === 'horizontal';
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const hasStartPoint = endpoints?.start && endpoints.start.trim() !== '';
  const hasEndPoint = endpoints?.end && endpoints.end.trim() !== '';
  const startColor = endpoints?.startColor || DEFAULT_START_COLOR;
  const endColor = endpoints?.endColor || DEFAULT_END_COLOR;
  const startStyle: EndpointStyle = endpoints?.startStyle || 'dot';
  const endStyle: EndpointStyle = endpoints?.endStyle || 'arrow';
  const thickness = lineThicknessValues[lineThickness];

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
        {/* Timeline line - using margin for centering (html2canvas compatible) */}
        <div
          className="absolute opacity-30"
          style={{
            backgroundColor: lineStyle === 'solid' ? 'var(--theme-primary)' : 'transparent',
            backgroundImage: lineStyle === 'dashed'
              ? `repeating-linear-gradient(${isHorizontal ? '90deg' : '180deg'}, var(--theme-primary), var(--theme-primary) 10px, transparent 10px, transparent 20px)`
              : lineStyle === 'dotted'
              ? `repeating-linear-gradient(${isHorizontal ? '90deg' : '180deg'}, var(--theme-primary), var(--theme-primary) 4px, transparent 4px, transparent 12px)`
              : undefined,
            ...(isHorizontal
              ? {
                  left: 0,
                  right: 0,
                  top: '50%',
                  marginTop: `-${parseInt(thickness) / 2}px`,
                  height: thickness,
                }
              : {
                  top: 0,
                  bottom: 0,
                  left: '32px',
                  width: thickness,
                }
            ),
          }}
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
              {/* Vertical mode: marker centered on timeline line (html2canvas compatible) */}
              {!isHorizontal && startStyle !== 'none' && (
                <div
                  className="absolute z-10 w-6"
                  style={{ left: '-48px', top: '50%', marginTop: '-8px' }}
                >
                  <EndpointMarker style={startStyle} color={startColor} direction="start" isHorizontal={isHorizontal} />
                </div>
              )}
              <div
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
                  ${isHorizontal ? 'text-center min-w-[80px] text-white' : 'text-[var(--theme-text)]'}
                `}
                style={
                  isHorizontal
                    ? { backgroundColor: startColor, borderColor: startColor }
                    : { backgroundColor: `${startColor}15`, borderColor: `${startColor}50` }
                }
              >
                {/* Marker in horizontal mode - before text */}
                {isHorizontal && startStyle !== 'none' && (
                  <EndpointMarker style={startStyle} color="white" direction="start" isHorizontal={isHorizontal} />
                )}
                <span>{endpoints?.start}</span>
              </div>
            </div>
          )}

          {entries.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Connector dot - using margin auto for centering (html2canvas compatible) */}
              <div
                className={`absolute z-10 ${isHorizontal ? '-top-6' : 'top-4'}`}
                style={isHorizontal
                  ? { left: '50%', marginLeft: '-6px' }
                  : { left: '-28px' }
                }
              >
                <div className="w-3 h-3 rounded-full bg-[var(--theme-primary)] border-2 border-[var(--theme-surface)]" />
              </div>

              {/* Item number badge - using text-align center and line-height for centering (html2canvas compatible) */}
              <div
                className={`absolute z-10 ${isHorizontal ? '-top-12' : 'top-3'}`}
                style={isHorizontal
                  ? { left: '50%', marginLeft: '-10px' }
                  : { left: '-48px' }
                }
              >
                <div
                  className="w-5 h-5 rounded-full bg-[var(--theme-primary)] text-white text-xs font-bold text-center"
                  style={{ lineHeight: '20px' }}
                >
                  {index + 1}
                </div>
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
              {/* Vertical mode: marker centered on timeline line (html2canvas compatible) */}
              {!isHorizontal && endStyle !== 'none' && (
                <div
                  className="absolute z-10 w-6"
                  style={{ left: '-48px', top: '50%', marginTop: '-8px' }}
                >
                  <EndpointMarker style={endStyle} color={endColor} direction="end" isHorizontal={isHorizontal} />
                </div>
              )}
              <div
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
                  ${isHorizontal ? 'text-center min-w-[80px] text-white' : 'text-[var(--theme-text)]'}
                `}
                style={
                  isHorizontal
                    ? { backgroundColor: endColor, borderColor: endColor }
                    : { backgroundColor: `${endColor}15`, borderColor: `${endColor}50` }
                }
              >
                <span>{endpoints?.end}</span>
                {/* Marker in horizontal mode - after text */}
                {isHorizontal && endStyle !== 'none' && (
                  <EndpointMarker style={endStyle} color="white" direction="end" isHorizontal={isHorizontal} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

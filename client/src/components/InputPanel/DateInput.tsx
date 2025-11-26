import { useState, useRef, useEffect } from 'react';

interface DateInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

type DateMode = 'text' | 'year' | 'month' | 'date';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DateInput({ id, value, onChange }: DateInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<DateMode>('text');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 5 + i);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleApply = () => {
    let dateStr = '';
    if (mode === 'year') {
      dateStr = String(selectedYear);
    } else if (mode === 'month') {
      dateStr = `${months[selectedMonth]} ${selectedYear}`;
    } else if (mode === 'date') {
      dateStr = `${selectedDay} ${months[selectedMonth]} ${selectedYear}`;
    }
    onChange(dateStr);
    setShowPicker(false);
  };

  const renderYearGrid = () => (
    <div className="grid grid-cols-4 gap-1">
      {years.map((year) => (
        <button
          key={year}
          type="button"
          onClick={() => setSelectedYear(year)}
          className={`px-2 py-1.5 text-xs rounded transition-colors ${
            selectedYear === year
              ? 'bg-[var(--theme-primary)] text-white'
              : 'hover:bg-gray-100 text-[var(--theme-text)]'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );

  const renderMonthGrid = () => (
    <div className="grid grid-cols-3 gap-1">
      {months.map((month, idx) => (
        <button
          key={month}
          type="button"
          onClick={() => setSelectedMonth(idx)}
          className={`px-2 py-1.5 text-xs rounded transition-colors ${
            selectedMonth === idx
              ? 'bg-[var(--theme-primary)] text-white'
              : 'hover:bg-gray-100 text-[var(--theme-text)]'
          }`}
        >
          {month.slice(0, 3)}
        </button>
      ))}
    </div>
  );

  const renderDayGrid = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, () => null);

    return (
      <div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs text-[var(--theme-text-muted)] font-medium py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {blanks.map((_, blankIdx) => (
            <div key={`blank-${blankIdx}`} className="w-7 h-7" />
          ))}
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`w-7 h-7 text-xs rounded transition-colors ${
                selectedDay === day
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'hover:bg-gray-100 text-[var(--theme-text)]'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., 2025, March 2025, or 15 March 2025"
          className="flex-1 px-3 py-2 border border-[var(--theme-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="px-2 py-2 border border-[var(--theme-border)] rounded-md hover:bg-gray-50 transition-colors"
          title="Open date picker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--theme-text-muted)]">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {showPicker && (
        <div className="absolute z-20 mt-1 right-0 bg-white border border-[var(--theme-border)] rounded-lg shadow-lg p-3 w-64">
          {/* Mode selector */}
          <div className="flex gap-1 mb-3 border-b border-[var(--theme-border)] pb-2">
            {(['year', 'month', 'date'] as DateMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 px-2 py-1 text-xs rounded capitalize transition-colors ${
                  mode === m
                    ? 'bg-[var(--theme-primary)] text-white'
                    : 'bg-gray-100 text-[var(--theme-text)] hover:bg-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Year selector (always shown for month and date modes) */}
          {(mode === 'month' || mode === 'date') && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <button
                  type="button"
                  onClick={() => setSelectedYear(y => y - 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-[var(--theme-text)]">{selectedYear}</span>
                <button
                  type="button"
                  onClick={() => setSelectedYear(y => y + 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Content based on mode */}
          <div className="mb-3">
            {mode === 'year' && renderYearGrid()}
            {mode === 'month' && renderMonthGrid()}
            {mode === 'date' && (
              <>
                <div className="text-center text-sm font-medium text-[var(--theme-text)] mb-2">
                  {months[selectedMonth]}
                </div>
                <div className="flex gap-1 mb-2">
                  {months.map((m, idx) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMonth(idx)}
                      className={`flex-1 text-xs py-0.5 rounded ${
                        selectedMonth === idx
                          ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]'
                          : 'hover:bg-gray-100 text-[var(--theme-text-muted)]'
                      }`}
                      title={m}
                    >
                      {m.slice(0, 1)}
                    </button>
                  ))}
                </div>
                {renderDayGrid()}
              </>
            )}
          </div>

          {/* Preview and Apply */}
          <div className="flex items-center justify-between border-t border-[var(--theme-border)] pt-2">
            <span className="text-xs text-[var(--theme-text-muted)]">
              {mode === 'year' && String(selectedYear)}
              {mode === 'month' && `${months[selectedMonth]} ${selectedYear}`}
              {mode === 'date' && `${selectedDay} ${months[selectedMonth]} ${selectedYear}`}
            </span>
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1 text-xs font-medium text-white bg-[var(--theme-primary)] rounded hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function MarkdownEditor({ id, value, onChange, placeholder, rows = 3 }: MarkdownEditorProps) {
  const [showModal, setShowModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert markdown syntax around selected text or at cursor
  const insertMarkdown = useCallback((prefix: string, suffix: string = prefix, targetRef?: React.RefObject<HTMLTextAreaElement | null>) => {
    const textarea = targetRef?.current || textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
      newCursorPos = start + prefix.length + selectedText.length + suffix.length;
    } else {
      newText = value.substring(0, start) + prefix + suffix + value.substring(end);
      newCursorPos = start + prefix.length;
    }

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  // Insert list item
  const insertList = useCallback((marker: string, targetRef?: React.RefObject<HTMLTextAreaElement | null>) => {
    const textarea = targetRef?.current || textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);

    const lastNewline = beforeCursor.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const currentLine = beforeCursor.substring(lineStart);

    let newText: string;
    let newCursorPos: number;

    if (currentLine.trim() === '') {
      newText = beforeCursor + marker + ' ' + afterCursor;
      newCursorPos = start + marker.length + 1;
    } else {
      newText = beforeCursor + '\n' + marker + ' ' + afterCursor;
      newCursorPos = start + marker.length + 2;
    }

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  // Insert link
  const insertLink = useCallback((targetRef?: React.RefObject<HTMLTextAreaElement | null>) => {
    const textarea = targetRef?.current || textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      newText = value.substring(0, start) + '[' + selectedText + '](url)' + value.substring(end);
      newCursorPos = start + selectedText.length + 3;
    } else {
      newText = value.substring(0, start) + '[text](url)' + value.substring(end);
      newCursorPos = start + 1;
    }

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(newCursorPos, newCursorPos + 3);
      } else {
        textarea.setSelectionRange(newCursorPos, newCursorPos + 4);
      }
    }, 0);
  }, [value, onChange]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>, targetRef?: React.RefObject<HTMLTextAreaElement | null>) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**', targetRef);
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('_', '_', targetRef);
          break;
        case 'k':
          e.preventDefault();
          insertLink(targetRef);
          break;
      }
    }
  }, [insertMarkdown, insertLink]);

  const ToolbarButtons = ({ targetRef }: { targetRef?: React.RefObject<HTMLTextAreaElement | null> }) => (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => insertMarkdown('**', '**', targetRef)}
        className="px-1.5 py-0.5 text-xs rounded hover:bg-gray-200 text-[var(--theme-text-muted)] transition-colors font-bold"
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('_', '_', targetRef)}
        className="px-1.5 py-0.5 text-xs rounded hover:bg-gray-200 text-[var(--theme-text-muted)] transition-colors italic"
        title="Italic (Ctrl+I)"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => insertLink(targetRef)}
        className="px-1.5 py-0.5 text-xs rounded hover:bg-gray-200 text-[var(--theme-text-muted)] transition-colors"
        title="Link (Ctrl+K)"
      >
        Link
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('`', '`', targetRef)}
        className="px-1.5 py-0.5 text-xs rounded hover:bg-gray-200 text-[var(--theme-text-muted)] transition-colors font-mono"
        title="Code"
      >
        {'{ }'}
      </button>
      <div className="w-px h-4 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => insertList('-', targetRef)}
        className="px-1.5 py-0.5 text-xs rounded hover:bg-gray-200 text-[var(--theme-text-muted)] transition-colors"
        title="Bullet list"
      >
        {'\u2022'}
      </button>
      <button
        type="button"
        onClick={() => insertList('1.', targetRef)}
        className="px-1.5 py-0.5 text-xs rounded hover:bg-gray-200 text-[var(--theme-text-muted)] transition-colors"
        title="Numbered list"
      >
        1.
      </button>
    </div>
  );

  return (
    <>
      <div className="border border-[var(--theme-border)] rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[var(--theme-primary)] focus-within:border-transparent">
        {/* Header with toolbar */}
        <div className="flex items-center justify-between bg-gray-50 border-b border-[var(--theme-border)] px-2 py-1">
          <ToolbarButtons />
          {/* Expand button */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="p-1 rounded hover:bg-gray-200 text-[var(--theme-text-muted)] transition-colors"
            title="Expand editor with preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 text-sm focus:outline-none resize-none"
        />
      </div>

      {/* Split View Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-4xl max-h-[80vh] h-[400px] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)]">
              <div className="flex items-center gap-4">
                <h3 className="font-medium text-[var(--theme-text)]">Edit Description</h3>
                <ToolbarButtons targetRef={modalTextareaRef} />
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-gray-100 text-[var(--theme-text-muted)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Split View Content */}
            <div className="flex-1 flex divide-x divide-[var(--theme-border)] overflow-hidden">
              {/* Editor pane */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="px-3 py-1 bg-gray-50 border-b border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)] font-medium">
                  Markdown
                </div>
                <textarea
                  ref={modalTextareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, modalTextareaRef)}
                  placeholder={placeholder}
                  className="flex-1 w-full px-3 py-2 text-sm focus:outline-none resize-none font-mono"
                  autoFocus
                />
              </div>
              {/* Preview pane */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="px-3 py-1 bg-gray-50 border-b border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)] font-medium">
                  Preview
                </div>
                <div className="flex-1 px-3 py-2 overflow-auto">
                  {value ? (
                    <div className="prose prose-sm max-w-none text-[var(--theme-text)] prose-headings:text-[var(--theme-text)] prose-a:text-[var(--theme-primary)]">
                      <ReactMarkdown>{value}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--theme-text-muted)] italic">Preview will appear here...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-[var(--theme-border)] bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] rounded-md hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

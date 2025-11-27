import { useState, useRef, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { StyleModal } from './components/StyleModal';
import { EndpointsModal } from './components/EndpointsModal';
import { useRoadmap } from './hooks/useRoadmap';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/Auth';
import { ShareModal } from './components/ShareModal';

function App() {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    savedRoadmaps,
    currentRoadmapId,
    switchRoadmap,
    createNewRoadmap,
    duplicateRoadmap,
    deleteRoadmap,
    viewMode,
    exitViewMode,
    title,
  } = useRoadmap();

  const { user, isLoading: authLoading, logout } = useAuth();

  const [showRoadmapMenu, setShowRoadmapMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showEndpointsModal, setShowEndpointsModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowRoadmapMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRoadmap = savedRoadmaps.find(r => r.id === currentRoadmapId);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show embed view for iframe embedding (minimal, no header)
  if (viewMode === 'embed') {
    return (
      <div className="h-screen overflow-auto bg-[var(--theme-background)]">
        <PreviewPanel />
      </div>
    );
  }

  // Show simplified view for shared/public roadmaps
  if (viewMode === 'view') {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        {/* View mode header */}
        <header className="bg-[var(--theme-surface)] border-b border-[var(--theme-border)] px-6 py-4 no-print" role="banner">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-[var(--theme-text)]">{title}</h1>
                <p className="text-sm text-[var(--theme-text-muted)]">
                  Shared roadmap (read-only)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={exitViewMode}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] rounded-md hover:opacity-90 transition-opacity"
            >
              Create Your Own
            </button>
          </div>
        </header>

        {/* Preview only - no editing */}
        <main className="flex-1 overflow-auto">
          <PreviewPanel />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Skip link for accessibility */}
      <a
        href="#roadmap-preview"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--theme-primary)] focus:text-white focus:rounded-md"
      >
        Skip to preview
      </a>

      {/* Header */}
      <header className="bg-[var(--theme-surface)] border-b border-[var(--theme-border)] px-6 py-4 no-print" role="banner">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-[var(--theme-text)]">Roadmapper</h1>
              <p className="text-sm text-[var(--theme-text-muted)]">
                Create simple, beautiful timelines
              </p>
            </div>

            {/* Undo/Redo buttons */}
            <div className="flex items-center gap-1 ml-4">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Undo (Ctrl+Z)"
                title="Undo (Ctrl+Z)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v6h6" />
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                </svg>
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Redo (Ctrl+Shift+Z)"
                title="Redo (Ctrl+Shift+Z)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 7v6h-6" />
                  <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Style button */}
            <button
              type="button"
              onClick={() => setShowStyleModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--theme-text)] hover:bg-gray-100 rounded-md transition-colors"
              title="Styling options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Style
            </button>

            {/* Endpoints button */}
            <button
              type="button"
              onClick={() => setShowEndpointsModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--theme-text)] hover:bg-gray-100 rounded-md transition-colors"
              title="Timeline endpoints"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5" cy="12" r="3" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <circle cx="19" cy="12" r="3" />
              </svg>
              Endpoints
            </button>

            {/* Share button - only show when logged in */}
            {user && (
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--theme-text)] hover:bg-gray-100 rounded-md transition-colors"
                title="Share roadmap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </button>
            )}

            {/* Roadmap selector */}
            <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowRoadmapMenu(!showRoadmapMenu)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--theme-text)] bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="max-w-[150px] truncate">{currentRoadmap?.title || 'My Roadmap'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showRoadmapMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-[var(--theme-border)] z-50">
                <div className="p-2 border-b border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      createNewRoadmap();
                      setShowRoadmapMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--theme-text)] hover:bg-gray-100 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      duplicateRoadmap();
                      setShowRoadmapMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--theme-text)] hover:bg-gray-100 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Duplicate Current
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto p-2">
                  <p className="px-3 py-1 text-xs font-medium text-[var(--theme-text-muted)] uppercase">
                    Saved Roadmaps ({savedRoadmaps.length})
                  </p>
                  {savedRoadmaps.map((roadmap) => (
                    <div
                      key={roadmap.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-md ${
                        roadmap.id === currentRoadmapId ? 'bg-[var(--theme-primary)]/10' : 'hover:bg-gray-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          switchRoadmap(roadmap.id);
                          setShowRoadmapMenu(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <p className="text-sm font-medium text-[var(--theme-text)] truncate">
                          {roadmap.title}
                        </p>
                        <p className="text-xs text-[var(--theme-text-muted)]">
                          {formatDate(roadmap.lastModified)} · {roadmap.entries.length} entries
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(roadmap.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                        aria-label={`Delete ${roadmap.title}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

            {/* User menu / Login button */}
            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--theme-text)] hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)] text-white flex items-center justify-center text-sm font-medium">
                    {(user.name?.[0] || user.email[0]).toUpperCase()}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[var(--theme-border)] z-50">
                    <div className="p-3 border-b border-[var(--theme-border)]">
                      <p className="text-sm font-medium text-[var(--theme-text)] truncate">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-[var(--theme-text-muted)] truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] rounded-md hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h2 id="delete-title" className="text-lg font-semibold text-[var(--theme-text)] mb-2">
              Delete Roadmap?
            </h2>
            <p className="text-sm text-[var(--theme-text-muted)] mb-4">
              This will permanently delete this roadmap. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-[var(--theme-text)] bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRoadmap(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                  setShowRoadmapMenu(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Input Panel - Left side */}
        <aside className="w-full lg:w-[400px] lg:min-w-[400px] border-r border-[var(--theme-border)] no-print overflow-y-auto">
          <InputPanel />
        </aside>

        {/* Preview Panel - Right side (fixed) */}
        <section className="flex-1 min-w-0 overflow-auto">
          <PreviewPanel />
        </section>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          roadmapId={currentRoadmapId}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Style Modal */}
      {showStyleModal && (
        <StyleModal onClose={() => setShowStyleModal(false)} />
      )}

      {/* Endpoints Modal */}
      {showEndpointsModal && (
        <EndpointsModal onClose={() => setShowEndpointsModal(false)} />
      )}
    </div>
  );
}

export default App;

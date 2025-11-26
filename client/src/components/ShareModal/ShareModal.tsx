import { useState, useEffect } from 'react';
import { api, type RoadmapWithAccess } from '../../api/client';
import { useToast } from '../../hooks/useToast';

interface ShareModalProps {
  roadmapId: string;
  onClose: () => void;
}

export function ShareModal({ roadmapId, onClose }: ShareModalProps) {
  const [roadmap, setRoadmap] = useState<RoadmapWithAccess | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>('initial');
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const publicUrl = `${window.location.origin}/public/${roadmapId}`;
  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : null;

  // Fetch roadmap data on mount
  useEffect(() => {
    api.getRoadmap(roadmapId)
      .then(({ roadmap }) => {
        setRoadmap(roadmap);
        setIsPublic(roadmap.isPublic);
        setShareToken(roadmap.shareToken);
        setLoading(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load roadmap');
        setLoading(null);
      });
  }, [roadmapId]);

  const handleTogglePublic = async () => {
    setLoading('visibility');
    try {
      const { roadmap: updated } = await api.setRoadmapVisibility(roadmapId, !isPublic);
      setIsPublic(updated.isPublic);
      setRoadmap(updated);
      toast.success(updated.isPublic ? 'Roadmap is now public' : 'Roadmap is now private');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update visibility');
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateToken = async () => {
    setLoading('token');
    try {
      const { roadmap: updated, shareToken: newToken } = await api.generateShareToken(roadmapId);
      setShareToken(newToken);
      setRoadmap(updated);
      toast.success('Share link generated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate share link');
    } finally {
      setLoading(null);
    }
  };

  const handleRevokeToken = async () => {
    setLoading('revoke');
    try {
      const { roadmap: updated } = await api.revokeShareToken(roadmapId);
      setShareToken(null);
      setRoadmap(updated);
      toast.success('Share link revoked');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke share link');
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--theme-surface)] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 id="share-dialog-title" className="text-lg font-semibold text-[var(--theme-text)]">
            Share Roadmap
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading state */}
        {loading === 'initial' && (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-[var(--theme-text-muted)]">Loading...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--theme-text)] bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-md hover:bg-[var(--theme-border)] transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Main content */}
        {roadmap && loading !== 'initial' && !error && (
          <>
            {/* Public toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-[var(--theme-text)]">Public access</h3>
                  <p className="text-xs text-[var(--theme-text-muted)]">
                    Anyone with the link can view this roadmap
                  </p>
                </div>
                <button
                  onClick={handleTogglePublic}
                  disabled={loading === 'visibility'}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isPublic ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
                  } ${loading === 'visibility' ? 'opacity-50' : ''}`}
                  role="switch"
                  aria-checked={isPublic}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isPublic ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isPublic && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="flex-1 px-3 py-2 text-sm bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-md text-[var(--theme-text)]"
                  />
                  <button
                    onClick={() => copyToClipboard(publicUrl, 'Public link')}
                    className="px-3 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] rounded-md hover:opacity-90 transition-opacity"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {/* Private share link */}
            <div className="border-t border-[var(--theme-border)] pt-4">
              <div className="mb-2">
                <h3 className="text-sm font-medium text-[var(--theme-text)]">Private share link</h3>
                <p className="text-xs text-[var(--theme-text-muted)]">
                  Share with specific people without making the roadmap public
                </p>
              </div>

              {shareToken ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl || ''}
                      className="flex-1 px-3 py-2 text-sm bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-md text-[var(--theme-text)]"
                    />
                    <button
                      onClick={() => shareUrl && copyToClipboard(shareUrl, 'Share link')}
                      className="px-3 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] rounded-md hover:opacity-90 transition-opacity"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateToken}
                      disabled={loading === 'token'}
                      className="flex-1 px-3 py-2 text-sm font-medium text-[var(--theme-text)] bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-md hover:bg-[var(--theme-border)] transition-colors disabled:opacity-50"
                    >
                      {loading === 'token' ? 'Generating...' : 'Regenerate link'}
                    </button>
                    <button
                      onClick={handleRevokeToken}
                      disabled={loading === 'revoke'}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {loading === 'revoke' ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGenerateToken}
                  disabled={loading === 'token'}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading === 'token' ? 'Generating...' : 'Generate share link'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

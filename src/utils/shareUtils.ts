import LZString from 'lz-string';
import type { RoadmapConfig } from '../types';

/**
 * Encodes a roadmap configuration into a URL-safe compressed string
 */
export function encodeRoadmap(roadmap: RoadmapConfig): string {
  // Create a minimal version without id and lastModified (regenerated on load)
  const shareableData = {
    t: roadmap.title,
    e: roadmap.entries.map(entry => ({
      t: entry.title,
      d: entry.description || undefined,
      dt: entry.date || undefined,
    })),
    th: roadmap.themeId,
    o: roadmap.orientation,
    f: roadmap.fontSize,
    s: roadmap.entryShape,
  };

  const json = JSON.stringify(shareableData);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

/**
 * Decodes a URL-safe compressed string back into a roadmap configuration
 */
export function decodeRoadmap(encoded: string): Partial<RoadmapConfig> | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;

    const data = JSON.parse(json);

    return {
      title: data.t || 'Shared Roadmap',
      entries: (data.e || []).map((entry: { t?: string; d?: string; dt?: string }, index: number) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        title: entry.t || '',
        description: entry.d || '',
        date: entry.dt || '',
      })),
      themeId: data.th || 'ocean',
      orientation: data.o || 'horizontal',
      fontSize: data.f || 'medium',
      entryShape: data.s || 'rounded',
    };
  } catch (e) {
    console.warn('Failed to decode shared roadmap:', e);
    return null;
  }
}

/**
 * Generates a shareable URL for the given roadmap
 */
export function generateShareableUrl(roadmap: RoadmapConfig): string {
  const encoded = encodeRoadmap(roadmap);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#share=${encoded}`;
}

/**
 * Extracts the shared data from the current URL hash if present
 */
export function getSharedDataFromUrl(): string | null {
  const hash = window.location.hash;
  if (hash.startsWith('#share=')) {
    return hash.substring(7); // Remove '#share=' prefix
  }
  return null;
}

/**
 * Clears the share hash from the URL without triggering a page reload
 */
export function clearShareHash(): void {
  if (window.location.hash.startsWith('#share=')) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

/**
 * Copies text to clipboard and returns success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      console.warn('Failed to copy to clipboard:', e);
      return false;
    }
  }
}

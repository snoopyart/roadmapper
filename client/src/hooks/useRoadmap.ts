import { useCallback, useEffect } from 'react';
import { useRoadmapContext } from '../context/RoadmapContext';
import type { TimelineEntry, Orientation, FontSize, EntryShape, Endpoints } from '../types';

export function useRoadmap() {
  const {
    state,
    dispatch,
    canUndo,
    canRedo,
    isLoading,
    isSaving,
    viewMode,
    exitViewMode,
    savedRoadmaps,
    currentRoadmapId,
    switchRoadmap,
    createNewRoadmap,
    duplicateRoadmap,
    deleteRoadmap,
  } = useRoadmapContext();

  const addEntry = useCallback(
    (entry?: Partial<TimelineEntry>) => {
      dispatch({ type: 'ADD_ENTRY', payload: entry });
    },
    [dispatch]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_ENTRY', payload: { id } });
    },
    [dispatch]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<TimelineEntry>) => {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id, updates } });
    },
    [dispatch]
  );

  const reorderEntries = useCallback(
    (entries: TimelineEntry[]) => {
      dispatch({ type: 'REORDER_ENTRIES', payload: { entries } });
    },
    [dispatch]
  );

  const setTitle = useCallback(
    (title: string) => {
      dispatch({ type: 'SET_TITLE', payload: { title } });
    },
    [dispatch]
  );

  const setTheme = useCallback(
    (themeId: string) => {
      dispatch({ type: 'SET_THEME', payload: { themeId } });
    },
    [dispatch]
  );

  const setOrientation = useCallback(
    (orientation: Orientation) => {
      dispatch({ type: 'SET_ORIENTATION', payload: { orientation } });
    },
    [dispatch]
  );

  const setFontSize = useCallback(
    (fontSize: FontSize) => {
      dispatch({ type: 'SET_FONT_SIZE', payload: { fontSize } });
    },
    [dispatch]
  );

  const setEntryShape = useCallback(
    (entryShape: EntryShape) => {
      dispatch({ type: 'SET_ENTRY_SHAPE', payload: { entryShape } });
    },
    [dispatch]
  );

  const setEndpoints = useCallback(
    (endpoints: Endpoints) => {
      dispatch({ type: 'SET_ENDPOINTS', payload: { endpoints } });
    },
    [dispatch]
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    // State
    id: state.id,
    title: state.title,
    entries: state.entries,
    themeId: state.themeId,
    orientation: state.orientation,
    fontSize: state.fontSize,
    entryShape: state.entryShape,
    endpoints: state.endpoints,
    lastModified: state.lastModified,

    // Entry operations
    addEntry,
    deleteEntry,
    updateEntry,
    reorderEntries,

    // Title
    setTitle,

    // Style operations
    setTheme,
    setOrientation,
    setFontSize,
    setEntryShape,
    setEndpoints,

    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,

    // Multi-roadmap
    savedRoadmaps,
    currentRoadmapId,
    switchRoadmap,
    createNewRoadmap,
    duplicateRoadmap,
    deleteRoadmap,

    // Loading states
    isLoading,
    isSaving,

    // View mode (for shared/public roadmaps)
    viewMode,
    exitViewMode,

    // Other
    reset,
  };
}

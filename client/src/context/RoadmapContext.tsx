import { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef, type ReactNode } from 'react';
import type { RoadmapState, RoadmapAction, TimelineEntry, RoadmapConfig, SavedRoadmapsState } from '../types';
import { applyTheme, applyFontFamily, getThemeById } from '../themes';
import { getSharedDataFromUrl, decodeRoadmap, clearShareHash } from '../utils/shareUtils';
import { useAuth } from './AuthContext';
import { api, type RoadmapWithAccess } from '../api/client';

const STORAGE_KEY = 'roadmapper-data-v2';
const MAX_HISTORY = 50;
const SAVE_DEBOUNCE_MS = 1000;

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createDefaultEntry = (overrides?: Partial<TimelineEntry>): TimelineEntry => ({
  id: generateId(),
  title: '',
  description: '',
  date: '',
  ...overrides,
});

const createDefaultRoadmap = (): RoadmapState => ({
  id: generateId(),
  title: 'My Roadmap',
  entries: [
    createDefaultEntry({ title: 'Project Kickoff', description: 'Initial planning and setup', date: 'January 2025' }),
    createDefaultEntry({ title: 'Development Phase', description: 'Core feature implementation', date: 'March 2025' }),
    createDefaultEntry({ title: 'Launch', date: 'June 2025' }),
  ],
  themeId: 'ocean',
  orientation: 'horizontal',
  fontSize: 'medium',
  entryShape: 'rounded',
  fontFamily: 'system',
  lineStyle: 'solid',
  lineThickness: 'medium',
  customColors: undefined,
  endpoints: { start: '', end: '' },
  lastModified: Date.now(),
});

// Convert API roadmap to local format
function apiToLocal(roadmap: RoadmapWithAccess): RoadmapConfig {
  return {
    id: roadmap.id,
    title: roadmap.title,
    entries: roadmap.entries,
    themeId: roadmap.themeId,
    orientation: roadmap.orientation,
    fontSize: roadmap.fontSize,
    entryShape: roadmap.entryShape,
    fontFamily: roadmap.fontFamily || 'system',
    lineStyle: roadmap.lineStyle || 'solid',
    lineThickness: roadmap.lineThickness || 'medium',
    customColors: roadmap.customColors,
    endpoints: roadmap.endpoints || { start: '', end: '' },
    lastModified: new Date(roadmap.updatedAt).getTime(),
  };
}

// History state for undo/redo
interface HistoryState {
  past: RoadmapState[];
  present: RoadmapState;
  future: RoadmapState[];
}

function roadmapReducer(state: RoadmapState, action: RoadmapAction): RoadmapState {
  const updateTimestamp = (s: RoadmapState): RoadmapState => ({
    ...s,
    lastModified: Date.now(),
  });

  switch (action.type) {
    case 'ADD_ENTRY':
      return updateTimestamp({
        ...state,
        entries: [...state.entries, createDefaultEntry(action.payload)],
      });

    case 'DELETE_ENTRY':
      return updateTimestamp({
        ...state,
        entries: state.entries.filter((entry) => entry.id !== action.payload.id),
      });

    case 'UPDATE_ENTRY':
      return updateTimestamp({
        ...state,
        entries: state.entries.map((entry) =>
          entry.id === action.payload.id ? { ...entry, ...action.payload.updates } : entry
        ),
      });

    case 'REORDER_ENTRIES':
      return updateTimestamp({
        ...state,
        entries: action.payload.entries,
      });

    case 'SET_TITLE':
      return updateTimestamp({
        ...state,
        title: action.payload.title,
      });

    case 'SET_THEME':
      return updateTimestamp({
        ...state,
        themeId: action.payload.themeId,
      });

    case 'SET_ORIENTATION':
      return updateTimestamp({
        ...state,
        orientation: action.payload.orientation,
      });

    case 'SET_FONT_SIZE':
      return updateTimestamp({
        ...state,
        fontSize: action.payload.fontSize,
      });

    case 'SET_ENTRY_SHAPE':
      return updateTimestamp({
        ...state,
        entryShape: action.payload.entryShape,
      });

    case 'SET_ENDPOINTS':
      return updateTimestamp({
        ...state,
        endpoints: action.payload.endpoints,
      });

    case 'SET_FONT_FAMILY':
      return updateTimestamp({
        ...state,
        fontFamily: action.payload.fontFamily,
      });

    case 'SET_LINE_STYLE':
      return updateTimestamp({
        ...state,
        lineStyle: action.payload.lineStyle,
      });

    case 'SET_LINE_THICKNESS':
      return updateTimestamp({
        ...state,
        lineThickness: action.payload.lineThickness,
      });

    case 'SET_CUSTOM_COLORS':
      return updateTimestamp({
        ...state,
        customColors: action.payload.customColors,
      });

    case 'LOAD_STATE':
      return action.payload;

    case 'RESET':
      return createDefaultRoadmap();

    default:
      return state;
  }
}

// Wrapper reducer for undo/redo
function historyReducer(
  state: HistoryState,
  action: RoadmapAction
): HistoryState {
  switch (action.type) {
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }

    case 'LOAD_STATE': {
      // Don't add to history when loading
      return {
        past: [],
        present: action.payload,
        future: [],
      };
    }

    default: {
      const newPresent = roadmapReducer(state.present, action);
      if (newPresent === state.present) return state;

      // Limit history size
      const newPast = [...state.past, state.present].slice(-MAX_HISTORY);

      return {
        past: newPast,
        present: newPresent,
        future: [], // Clear future on new action
      };
    }
  }
}

interface RoadmapContextValue {
  state: RoadmapState;
  dispatch: React.Dispatch<RoadmapAction>;
  canUndo: boolean;
  canRedo: boolean;
  isLoading: boolean;
  isSaving: boolean;
  viewMode: 'edit' | 'view' | 'embed'; // 'view' for shared/public read-only, 'embed' for iframe embeds
  exitViewMode: () => void;
  // Multi-roadmap functions
  savedRoadmaps: RoadmapConfig[];
  currentRoadmapId: string;
  switchRoadmap: (id: string) => void;
  createNewRoadmap: () => void;
  duplicateRoadmap: () => void;
  deleteRoadmap: (id: string) => void;
  importFromShare: (data: Partial<RoadmapConfig>) => void;
}

// Parse URL for /share/{token}, /public/{id}, or /embed/{id}
function parseShareUrl(): { type: 'share' | 'public' | 'embed'; id: string } | null {
  const path = window.location.pathname;
  const shareMatch = path.match(/^\/share\/([a-zA-Z0-9_-]+)$/);
  if (shareMatch) {
    return { type: 'share', id: shareMatch[1] };
  }
  const publicMatch = path.match(/^\/public\/([a-zA-Z0-9_-]+)$/);
  if (publicMatch) {
    return { type: 'public', id: publicMatch[1] };
  }
  const embedMatch = path.match(/^\/embed\/([a-zA-Z0-9_-]+)$/);
  if (embedMatch) {
    return { type: 'embed', id: embedMatch[1] };
  }
  return null;
}

const RoadmapContext = createContext<RoadmapContextValue | null>(null);

function loadSavedRoadmaps(): SavedRoadmapsState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as SavedRoadmapsState;
      if (parsed.roadmaps && Array.isArray(parsed.roadmaps) && parsed.roadmaps.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved roadmap data:', e);
  }

  // Migrate from old storage format
  try {
    const oldSaved = localStorage.getItem('roadmapper-data');
    if (oldSaved) {
      const oldParsed = JSON.parse(oldSaved);
      if (oldParsed.entries && Array.isArray(oldParsed.entries)) {
        const migratedRoadmap: RoadmapConfig = {
          id: generateId(),
          title: 'My Roadmap',
          entries: oldParsed.entries,
          themeId: oldParsed.themeId || 'ocean',
          orientation: oldParsed.orientation || 'horizontal',
          fontSize: oldParsed.fontSize || 'medium',
          entryShape: oldParsed.entryShape || 'rounded',
          fontFamily: oldParsed.fontFamily || 'system',
          lineStyle: oldParsed.lineStyle || 'solid',
          lineThickness: oldParsed.lineThickness || 'medium',
          customColors: oldParsed.customColors,
          endpoints: oldParsed.endpoints || { start: '', end: '' },
          lastModified: Date.now(),
        };
        return {
          currentId: migratedRoadmap.id,
          roadmaps: [migratedRoadmap],
        };
      }
    }
  } catch (e) {
    console.warn('Failed to migrate old roadmap data:', e);
  }

  const defaultRoadmap = createDefaultRoadmap();
  return {
    currentId: defaultRoadmap.id,
    roadmaps: [defaultRoadmap],
  };
}

function saveSavedRoadmaps(data: SavedRoadmapsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save roadmap data:', e);
  }
}

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Load initial state from localStorage
  const initialSavedState = loadSavedRoadmaps();
  const initialRoadmap = initialSavedState.roadmaps.find(r => r.id === initialSavedState.currentId) || initialSavedState.roadmaps[0];

  const [historyState, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialRoadmap,
    future: [],
  });

  const [savedRoadmaps, setSavedRoadmaps] = useReducer(
    (state: RoadmapConfig[], action: { type: string; payload?: RoadmapConfig | string | RoadmapConfig[] }) => {
      switch (action.type) {
        case 'UPDATE':
          return state.map(r => r.id === (action.payload as RoadmapConfig).id ? action.payload as RoadmapConfig : r);
        case 'ADD':
          return [...state, action.payload as RoadmapConfig];
        case 'DELETE':
          return state.filter(r => r.id !== action.payload);
        case 'SET':
          return action.payload as RoadmapConfig[];
        default:
          return state;
      }
    },
    initialSavedState.roadmaps
  );

  const [currentRoadmapId, setCurrentRoadmapId] = useReducer(
    (_: string, action: string) => action,
    initialSavedState.currentId
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiInitialized, setApiInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'view' | 'embed'>('edit');
  const [shareUrlChecked, setShareUrlChecked] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const prevUserRef = useRef<typeof user>(null);

  const state = historyState.present;
  const canUndo = historyState.past.length > 0;
  const canRedo = historyState.future.length > 0;

  // Check for /share/{token}, /public/{id}, or /embed/{id} URL on mount
  useEffect(() => {
    if (shareUrlChecked) return;

    const shareInfo = parseShareUrl();
    if (shareInfo) {
      setIsLoading(true);
      setViewMode(shareInfo.type === 'embed' ? 'embed' : 'view');

      // Embed uses public roadmap API (same as public)
      const fetchPromise = shareInfo.type === 'share'
        ? api.getSharedRoadmap(shareInfo.id)
        : api.getPublicRoadmap(shareInfo.id);

      fetchPromise
        .then(({ roadmap }) => {
          const loadedRoadmap = apiToLocal(roadmap);
          dispatch({ type: 'LOAD_STATE', payload: loadedRoadmap });
        })
        .catch((err) => {
          console.error('Failed to load shared roadmap:', err);
          // On error, redirect to home
          window.history.replaceState(null, '', '/');
          setViewMode('edit');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    setShareUrlChecked(true);
  }, [shareUrlChecked]);

  const exitViewMode = useCallback(() => {
    setViewMode('edit');
    window.history.replaceState(null, '', '/');
    // Reload local/user roadmaps
    const localData = loadSavedRoadmaps();
    setSavedRoadmaps({ type: 'SET', payload: localData.roadmaps });
    setCurrentRoadmapId(localData.currentId);
    const roadmap = localData.roadmaps.find(r => r.id === localData.currentId) || localData.roadmaps[0];
    dispatch({ type: 'LOAD_STATE', payload: roadmap });
  }, []);

  // Load roadmaps from API when authenticated
  useEffect(() => {
    if (authLoading) return;

    // Detect login (user changed from null to logged in)
    const justLoggedIn = user && !prevUserRef.current;
    prevUserRef.current = user;

    if (isAuthenticated && (justLoggedIn || !apiInitialized)) {
      setIsLoading(true);
      api.listRoadmaps()
        .then(async ({ roadmaps }) => {
          if (roadmaps.length === 0 && justLoggedIn) {
            // User has no roadmaps, migrate localStorage data
            const localData = loadSavedRoadmaps();
            const migratedRoadmaps: RoadmapConfig[] = [];

            for (const localRoadmap of localData.roadmaps) {
              try {
                const { roadmap } = await api.createRoadmap({
                  title: localRoadmap.title,
                  entries: localRoadmap.entries,
                  themeId: localRoadmap.themeId,
                  orientation: localRoadmap.orientation,
                  fontSize: localRoadmap.fontSize,
                  entryShape: localRoadmap.entryShape,
                });
                migratedRoadmaps.push(apiToLocal(roadmap));
              } catch (e) {
                console.error('Failed to migrate roadmap:', e);
              }
            }

            if (migratedRoadmaps.length > 0) {
              setSavedRoadmaps({ type: 'SET', payload: migratedRoadmaps });
              setCurrentRoadmapId(migratedRoadmaps[0].id);
              dispatch({ type: 'LOAD_STATE', payload: migratedRoadmaps[0] });
              lastSavedRef.current = JSON.stringify(migratedRoadmaps[0]);
              // Clear localStorage after successful migration
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem('roadmapper-data');
            }
          } else if (roadmaps.length > 0) {
            // Load roadmaps from server
            const loadedRoadmaps = roadmaps.map(apiToLocal);
            setSavedRoadmaps({ type: 'SET', payload: loadedRoadmaps });
            setCurrentRoadmapId(loadedRoadmaps[0].id);
            dispatch({ type: 'LOAD_STATE', payload: loadedRoadmaps[0] });
            lastSavedRef.current = JSON.stringify(loadedRoadmaps[0]);
          }
          setApiInitialized(true);
        })
        .catch((err) => {
          console.error('Failed to load roadmaps:', err);
          setApiInitialized(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!isAuthenticated && apiInitialized) {
      // User logged out, reset to localStorage
      setApiInitialized(false);
      lastSavedRef.current = '';
      const localData = loadSavedRoadmaps();
      setSavedRoadmaps({ type: 'SET', payload: localData.roadmaps });
      setCurrentRoadmapId(localData.currentId);
      const roadmap = localData.roadmaps.find(r => r.id === localData.currentId) || localData.roadmaps[0];
      dispatch({ type: 'LOAD_STATE', payload: roadmap });
    }
  }, [isAuthenticated, authLoading, user, apiInitialized]);

  // Save current roadmap to the list whenever it changes (local state only)
  useEffect(() => {
    setSavedRoadmaps({ type: 'UPDATE', payload: state });
  }, [state]);

  // Persist to localStorage (only when not authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      saveSavedRoadmaps({
        currentId: currentRoadmapId,
        roadmaps: savedRoadmaps,
      });
    }
  }, [savedRoadmaps, currentRoadmapId, isAuthenticated]);

  // Debounced save to API when authenticated
  useEffect(() => {
    if (!isAuthenticated || isLoading || !apiInitialized) return;

    // Don't save if state hasn't actually changed
    const stateKey = JSON.stringify({
      id: state.id,
      title: state.title,
      entries: state.entries,
      themeId: state.themeId,
      orientation: state.orientation,
      fontSize: state.fontSize,
      entryShape: state.entryShape,
      fontFamily: state.fontFamily,
      lineStyle: state.lineStyle,
      lineThickness: state.lineThickness,
      customColors: state.customColors,
      endpoints: state.endpoints,
    });

    if (stateKey === lastSavedRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      api.updateRoadmap(state.id, {
        title: state.title,
        entries: state.entries,
        themeId: state.themeId,
        orientation: state.orientation,
        fontSize: state.fontSize,
        entryShape: state.entryShape,
        fontFamily: state.fontFamily,
        lineStyle: state.lineStyle,
        lineThickness: state.lineThickness,
        customColors: state.customColors,
        endpoints: state.endpoints,
      })
        .then(() => {
          lastSavedRef.current = stateKey;
        })
        .catch((err) => {
          console.error('Failed to save roadmap:', err);
        })
        .finally(() => {
          setIsSaving(false);
        });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, isAuthenticated, isLoading, apiInitialized]);

  // Apply theme, custom colors, and font family on mount and when they change
  useEffect(() => {
    const theme = getThemeById(state.themeId);
    applyTheme(theme, state.customColors);
  }, [state.themeId, state.customColors]);

  useEffect(() => {
    applyFontFamily(state.fontFamily);
  }, [state.fontFamily]);

  const switchRoadmap = useCallback((id: string) => {
    const roadmap = savedRoadmaps.find(r => r.id === id);
    if (roadmap) {
      setCurrentRoadmapId(id);
      dispatch({ type: 'LOAD_STATE', payload: roadmap });
      lastSavedRef.current = ''; // Reset to trigger potential save
    }
  }, [savedRoadmaps]);

  const createNewRoadmap = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const { roadmap } = await api.createRoadmap({});
        const newRoadmap = apiToLocal(roadmap);
        setSavedRoadmaps({ type: 'ADD', payload: newRoadmap });
        setCurrentRoadmapId(newRoadmap.id);
        dispatch({ type: 'LOAD_STATE', payload: newRoadmap });
        lastSavedRef.current = JSON.stringify(newRoadmap);
      } catch (err) {
        console.error('Failed to create roadmap:', err);
      }
    } else {
      const newRoadmap = createDefaultRoadmap();
      setSavedRoadmaps({ type: 'ADD', payload: newRoadmap });
      setCurrentRoadmapId(newRoadmap.id);
      dispatch({ type: 'LOAD_STATE', payload: newRoadmap });
    }
  }, [isAuthenticated]);

  const duplicateRoadmap = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const { roadmap } = await api.duplicateRoadmap(state.id);
        const newRoadmap = apiToLocal(roadmap);
        setSavedRoadmaps({ type: 'ADD', payload: newRoadmap });
        setCurrentRoadmapId(newRoadmap.id);
        dispatch({ type: 'LOAD_STATE', payload: newRoadmap });
        lastSavedRef.current = JSON.stringify(newRoadmap);
      } catch (err) {
        console.error('Failed to duplicate roadmap:', err);
      }
    } else {
      const duplicate: RoadmapConfig = {
        ...state,
        id: generateId(),
        title: `${state.title} (Copy)`,
        lastModified: Date.now(),
      };
      setSavedRoadmaps({ type: 'ADD', payload: duplicate });
      setCurrentRoadmapId(duplicate.id);
      dispatch({ type: 'LOAD_STATE', payload: duplicate });
    }
  }, [state, isAuthenticated]);

  const deleteRoadmap = useCallback(async (id: string) => {
    if (savedRoadmaps.length <= 1) {
      // Can't delete the last roadmap, create a new one first
      if (isAuthenticated) {
        try {
          const { roadmap } = await api.createRoadmap({});
          const newRoadmap = apiToLocal(roadmap);
          await api.deleteRoadmap(id);
          setSavedRoadmaps({ type: 'SET', payload: [newRoadmap] });
          setCurrentRoadmapId(newRoadmap.id);
          dispatch({ type: 'LOAD_STATE', payload: newRoadmap });
          lastSavedRef.current = JSON.stringify(newRoadmap);
        } catch (err) {
          console.error('Failed to delete roadmap:', err);
        }
      } else {
        const newRoadmap = createDefaultRoadmap();
        setSavedRoadmaps({ type: 'SET', payload: [newRoadmap] });
        setCurrentRoadmapId(newRoadmap.id);
        dispatch({ type: 'LOAD_STATE', payload: newRoadmap });
      }
      return;
    }

    if (isAuthenticated) {
      try {
        await api.deleteRoadmap(id);
        setSavedRoadmaps({ type: 'DELETE', payload: id });

        // If deleting current, switch to another
        if (id === currentRoadmapId) {
          const remaining = savedRoadmaps.filter(r => r.id !== id);
          const next = remaining[0];
          setCurrentRoadmapId(next.id);
          dispatch({ type: 'LOAD_STATE', payload: next });
          lastSavedRef.current = '';
        }
      } catch (err) {
        console.error('Failed to delete roadmap:', err);
      }
    } else {
      setSavedRoadmaps({ type: 'DELETE', payload: id });

      // If deleting current, switch to another
      if (id === currentRoadmapId) {
        const remaining = savedRoadmaps.filter(r => r.id !== id);
        const next = remaining[0];
        setCurrentRoadmapId(next.id);
        dispatch({ type: 'LOAD_STATE', payload: next });
      }
    }
  }, [savedRoadmaps, currentRoadmapId, isAuthenticated]);

  const importFromShare = useCallback(async (data: Partial<RoadmapConfig>) => {
    if (isAuthenticated) {
      try {
        const { roadmap } = await api.createRoadmap({
          title: data.title || 'Shared Roadmap',
          entries: data.entries,
          themeId: data.themeId,
          orientation: data.orientation,
          fontSize: data.fontSize,
          entryShape: data.entryShape,
          fontFamily: data.fontFamily,
          lineStyle: data.lineStyle,
          lineThickness: data.lineThickness,
          customColors: data.customColors,
          endpoints: data.endpoints,
        });
        const newRoadmap = apiToLocal(roadmap);
        setSavedRoadmaps({ type: 'ADD', payload: newRoadmap });
        setCurrentRoadmapId(newRoadmap.id);
        dispatch({ type: 'LOAD_STATE', payload: newRoadmap });
        lastSavedRef.current = JSON.stringify(newRoadmap);
      } catch (err) {
        console.error('Failed to import roadmap:', err);
      }
    } else {
      const newRoadmap: RoadmapConfig = {
        id: generateId(),
        title: data.title || 'Shared Roadmap',
        entries: data.entries || [],
        themeId: data.themeId || 'ocean',
        orientation: data.orientation || 'horizontal',
        fontSize: data.fontSize || 'medium',
        entryShape: data.entryShape || 'rounded',
        fontFamily: data.fontFamily || 'system',
        lineStyle: data.lineStyle || 'solid',
        lineThickness: data.lineThickness || 'medium',
        customColors: data.customColors,
        endpoints: data.endpoints || { start: '', end: '' },
        lastModified: Date.now(),
      };
      setSavedRoadmaps({ type: 'ADD', payload: newRoadmap });
      setCurrentRoadmapId(newRoadmap.id);
      dispatch({ type: 'LOAD_STATE', payload: newRoadmap });
    }
  }, [isAuthenticated]);

  // Check for shared URL on mount
  const [sharedDataChecked, setSharedDataChecked] = useState(false);
  useEffect(() => {
    if (sharedDataChecked || authLoading) return;

    const sharedData = getSharedDataFromUrl();
    if (sharedData) {
      const decoded = decodeRoadmap(sharedData);
      if (decoded) {
        importFromShare(decoded);
        clearShareHash();
      }
    }
    setSharedDataChecked(true);
  }, [sharedDataChecked, importFromShare, authLoading]);

  return (
    <RoadmapContext.Provider value={{
      state,
      dispatch,
      canUndo,
      canRedo,
      isLoading: isLoading || authLoading,
      isSaving,
      viewMode,
      exitViewMode,
      savedRoadmaps,
      currentRoadmapId,
      switchRoadmap,
      createNewRoadmap,
      duplicateRoadmap,
      deleteRoadmap,
      importFromShare,
    }}>
      {children}
    </RoadmapContext.Provider>
  );
}

export function useRoadmapContext(): RoadmapContextValue {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmapContext must be used within a RoadmapProvider');
  }
  return context;
}

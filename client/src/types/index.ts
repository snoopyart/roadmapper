export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  date?: string;
}

export type Orientation = 'horizontal' | 'vertical';
export type FontSize = 'small' | 'medium' | 'large';
export type EntryShape = 'rounded' | 'square' | 'minimal';

export interface Endpoints {
  start: string;
  end: string;
  startColor?: string;
  endColor?: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
}

export interface RoadmapConfig {
  id: string;
  title: string;
  entries: TimelineEntry[];
  themeId: string;
  orientation: Orientation;
  fontSize: FontSize;
  entryShape: EntryShape;
  endpoints: Endpoints;
  lastModified: number;
}

export interface RoadmapState extends RoadmapConfig {
  // UI state
}

// For storing multiple roadmaps
export interface SavedRoadmapsState {
  currentId: string;
  roadmaps: RoadmapConfig[];
}

export type RoadmapAction =
  | { type: 'ADD_ENTRY'; payload?: Partial<TimelineEntry> }
  | { type: 'DELETE_ENTRY'; payload: { id: string } }
  | { type: 'UPDATE_ENTRY'; payload: { id: string; updates: Partial<TimelineEntry> } }
  | { type: 'REORDER_ENTRIES'; payload: { entries: TimelineEntry[] } }
  | { type: 'SET_TITLE'; payload: { title: string } }
  | { type: 'SET_THEME'; payload: { themeId: string } }
  | { type: 'SET_ORIENTATION'; payload: { orientation: Orientation } }
  | { type: 'SET_FONT_SIZE'; payload: { fontSize: FontSize } }
  | { type: 'SET_ENTRY_SHAPE'; payload: { entryShape: EntryShape } }
  | { type: 'SET_ENDPOINTS'; payload: { endpoints: Endpoints } }
  | { type: 'LOAD_STATE'; payload: RoadmapState }
  | { type: 'RESET' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  date?: string;
}

export type Orientation = 'horizontal' | 'vertical';
export type FontSize = 'small' | 'medium' | 'large';
export type EntryShape = 'rounded' | 'square' | 'minimal' | 'ghost';
export type FontFamily = 'system' | 'serif' | 'mono' | 'inter' | 'playfair' | 'roboto' | 'opensans' | 'lato' | 'poppins' | 'montserrat' | 'raleway' | 'merriweather' | 'sourcecode' | 'nunito' | 'oswald';
export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type LineThickness = 'thin' | 'medium' | 'thick';
export type Permission = 'view' | 'edit';

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export type EndpointStyle = 'none' | 'dot' | 'arrow' | 'diamond' | 'square';

export interface Endpoints {
  start: string;
  end: string;
  startColor?: string;
  endColor?: string;
  startStyle?: EndpointStyle;
  endStyle?: EndpointStyle;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Roadmap {
  id: string;
  ownerId: string;
  title: string;
  entries: TimelineEntry[];
  themeId: string;
  orientation: Orientation;
  fontSize: FontSize;
  entryShape: EntryShape;
  fontFamily?: FontFamily;
  lineStyle?: LineStyle;
  lineThickness?: LineThickness;
  customColors?: CustomColors;
  endpoints?: Endpoints;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collaborator {
  id: string;
  roadmapId: string;
  userId: string;
  permission: Permission;
  invitedAt: Date;
  user?: User;
}

export interface RoadmapWithAccess extends Roadmap {
  permission: Permission | 'owner';
  owner?: User;
  collaborators?: Collaborator[];
}

// API Request/Response types
export interface CreateRoadmapRequest {
  title?: string;
  entries?: TimelineEntry[];
  themeId?: string;
  orientation?: Orientation;
  fontSize?: FontSize;
  entryShape?: EntryShape;
  fontFamily?: FontFamily;
  lineStyle?: LineStyle;
  lineThickness?: LineThickness;
  customColors?: CustomColors;
  endpoints?: Endpoints;
}

export interface UpdateRoadmapRequest {
  title?: string;
  entries?: TimelineEntry[];
  themeId?: string;
  orientation?: Orientation;
  fontSize?: FontSize;
  entryShape?: EntryShape;
  fontFamily?: FontFamily;
  lineStyle?: LineStyle;
  lineThickness?: LineThickness;
  customColors?: CustomColors;
  endpoints?: Endpoints;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface InviteCollaboratorRequest {
  email: string;
  permission: Permission;
}

// JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
}

// Express extensions
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

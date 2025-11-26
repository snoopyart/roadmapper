export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  date?: string;
}

export type Orientation = 'horizontal' | 'vertical';
export type FontSize = 'small' | 'medium' | 'large';
export type EntryShape = 'rounded' | 'square' | 'minimal';
export type Permission = 'view' | 'edit';

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
}

export interface UpdateRoadmapRequest {
  title?: string;
  entries?: TimelineEntry[];
  themeId?: string;
  orientation?: Orientation;
  fontSize?: FontSize;
  entryShape?: EntryShape;
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

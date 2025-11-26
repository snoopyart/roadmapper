const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiError {
  error: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Request failed');
    }

    return data as T;
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me');
  }

  // Roadmap endpoints
  async listRoadmaps() {
    return this.request<{ roadmaps: RoadmapWithAccess[] }>('/roadmaps');
  }

  async getRoadmap(id: string) {
    return this.request<{ roadmap: RoadmapWithAccess }>(`/roadmaps/${id}`);
  }

  async getPublicRoadmap(id: string) {
    return this.request<{ roadmap: RoadmapWithAccess }>(`/roadmaps/public/${id}`);
  }

  async getSharedRoadmap(token: string) {
    return this.request<{ roadmap: RoadmapWithAccess }>(`/roadmaps/shared/${token}`);
  }

  async createRoadmap(data: CreateRoadmapRequest) {
    return this.request<{ roadmap: RoadmapWithAccess }>('/roadmaps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoadmap(id: string, data: UpdateRoadmapRequest) {
    return this.request<{ roadmap: RoadmapWithAccess }>(`/roadmaps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoadmap(id: string) {
    return this.request<{ success: boolean }>(`/roadmaps/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateRoadmap(id: string) {
    return this.request<{ roadmap: RoadmapWithAccess }>(`/roadmaps/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async setRoadmapVisibility(id: string, isPublic: boolean) {
    return this.request<{ roadmap: RoadmapWithAccess }>(`/roadmaps/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    });
  }

  async generateShareToken(id: string) {
    return this.request<{ roadmap: RoadmapWithAccess; shareToken: string }>(
      `/roadmaps/${id}/share-token`,
      { method: 'POST' }
    );
  }

  async revokeShareToken(id: string) {
    return this.request<{ roadmap: RoadmapWithAccess }>(`/roadmaps/${id}/share-token`, {
      method: 'DELETE',
    });
  }

  // Collaborator endpoints
  async listCollaborators(roadmapId: string) {
    return this.request<{ collaborators: CollaboratorWithUser[] }>(
      `/roadmaps/${roadmapId}/collaborators`
    );
  }

  async inviteCollaborator(roadmapId: string, email: string, permission: 'view' | 'edit') {
    return this.request<{ collaborator: CollaboratorWithUser }>(
      `/roadmaps/${roadmapId}/collaborators`,
      {
        method: 'POST',
        body: JSON.stringify({ email, permission }),
      }
    );
  }

  async updateCollaboratorPermission(roadmapId: string, userId: string, permission: 'view' | 'edit') {
    return this.request<{ collaborator: CollaboratorWithUser }>(
      `/roadmaps/${roadmapId}/collaborators/${userId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ permission }),
      }
    );
  }

  async removeCollaborator(roadmapId: string, userId: string) {
    return this.request<{ success: boolean }>(
      `/roadmaps/${roadmapId}/collaborators/${userId}`,
      { method: 'DELETE' }
    );
  }
}

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  date?: string;
}

export interface RoadmapWithAccess {
  id: string;
  ownerId: string;
  title: string;
  entries: TimelineEntry[];
  themeId: string;
  orientation: 'horizontal' | 'vertical';
  fontSize: 'small' | 'medium' | 'large';
  entryShape: 'rounded' | 'square' | 'minimal';
  isPublic: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
  permission: 'view' | 'edit' | 'owner';
  owner?: User;
}

export interface CollaboratorWithUser {
  id: string;
  roadmapId: string;
  userId: string;
  permission: 'view' | 'edit';
  invitedAt: string;
  user: User;
}

export interface CreateRoadmapRequest {
  title?: string;
  entries?: TimelineEntry[];
  themeId?: string;
  orientation?: 'horizontal' | 'vertical';
  fontSize?: 'small' | 'medium' | 'large';
  entryShape?: 'rounded' | 'square' | 'minimal';
}

export interface UpdateRoadmapRequest extends CreateRoadmapRequest {}

export const api = new ApiClient();

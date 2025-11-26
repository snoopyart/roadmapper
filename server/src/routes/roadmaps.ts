import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { query } from '../db/index.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import type { Roadmap, RoadmapWithAccess, Permission, TimelineEntry } from '../types/index.js';

const router = Router();

const timelineEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
});

const createRoadmapSchema = z.object({
  title: z.string().optional(),
  entries: z.array(timelineEntrySchema).optional(),
  themeId: z.string().optional(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  entryShape: z.enum(['rounded', 'square', 'minimal']).optional(),
});

const updateRoadmapSchema = createRoadmapSchema;

interface DbRoadmap {
  id: string;
  owner_id: string;
  title: string;
  entries: TimelineEntry[];
  theme_id: string;
  orientation: string;
  font_size: string;
  entry_shape: string;
  is_public: boolean;
  share_token: string | null;
  created_at: Date;
  updated_at: Date;
  permission?: Permission | 'owner';
  owner_email?: string;
  owner_name?: string;
}

function mapDbToRoadmap(row: DbRoadmap): RoadmapWithAccess {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    entries: row.entries,
    themeId: row.theme_id,
    orientation: row.orientation as 'horizontal' | 'vertical',
    fontSize: row.font_size as 'small' | 'medium' | 'large',
    entryShape: row.entry_shape as 'rounded' | 'square' | 'minimal',
    isPublic: row.is_public,
    shareToken: row.share_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    permission: row.permission || 'owner',
    owner: row.owner_email ? {
      id: row.owner_id,
      email: row.owner_email,
      name: row.owner_name || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } : undefined,
  };
}

// GET /api/roadmaps - List user's roadmaps + shared with them
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query<DbRoadmap>(
      `SELECT r.*,
              CASE WHEN r.owner_id = $1 THEN 'owner' ELSE c.permission END as permission,
              u.email as owner_email, u.name as owner_name
       FROM roadmaps r
       LEFT JOIN collaborators c ON c.roadmap_id = r.id AND c.user_id = $1
       LEFT JOIN users u ON u.id = r.owner_id
       WHERE r.owner_id = $1 OR c.user_id = $1
       ORDER BY r.updated_at DESC`,
      [req.user!.userId]
    );

    res.json({ roadmaps: result.rows.map(mapDbToRoadmap) });
  } catch (err) {
    console.error('List roadmaps error:', err);
    res.status(500).json({ error: 'Failed to list roadmaps' });
  }
});

// POST /api/roadmaps - Create new roadmap
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createRoadmapSchema.parse(req.body);

    const result = await query<DbRoadmap>(
      `INSERT INTO roadmaps (owner_id, title, entries, theme_id, orientation, font_size, entry_shape)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user!.userId,
        data.title || 'My Roadmap',
        JSON.stringify(data.entries || []),
        data.themeId || 'ocean',
        data.orientation || 'horizontal',
        data.fontSize || 'medium',
        data.entryShape || 'rounded',
      ]
    );

    const roadmap = mapDbToRoadmap(result.rows[0]);
    roadmap.permission = 'owner';
    res.status(201).json({ roadmap });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error('Create roadmap error:', err);
    res.status(500).json({ error: 'Failed to create roadmap' });
  }
});

// GET /api/roadmaps/public/:id - View public roadmap (no auth required)
router.get('/public/:id', async (req: Request, res: Response) => {
  try {
    const result = await query<DbRoadmap>(
      `SELECT r.*, u.email as owner_email, u.name as owner_name
       FROM roadmaps r
       LEFT JOIN users u ON u.id = r.owner_id
       WHERE r.id = $1 AND r.is_public = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Roadmap not found or not public' });
      return;
    }

    const roadmap = mapDbToRoadmap(result.rows[0]);
    roadmap.permission = 'view';
    res.json({ roadmap });
  } catch (err) {
    console.error('Get public roadmap error:', err);
    res.status(500).json({ error: 'Failed to get roadmap' });
  }
});

// GET /api/roadmaps/shared/:token - View via share token (no auth required)
router.get('/shared/:token', async (req: Request, res: Response) => {
  try {
    const result = await query<DbRoadmap>(
      `SELECT r.*, u.email as owner_email, u.name as owner_name
       FROM roadmaps r
       LEFT JOIN users u ON u.id = r.owner_id
       WHERE r.share_token = $1`,
      [req.params.token]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Roadmap not found' });
      return;
    }

    const roadmap = mapDbToRoadmap(result.rows[0]);
    roadmap.permission = 'view';
    res.json({ roadmap });
  } catch (err) {
    console.error('Get shared roadmap error:', err);
    res.status(500).json({ error: 'Failed to get roadmap' });
  }
});

// GET /api/roadmaps/:id - Get single roadmap
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    // First check if it's public or user has access
    const result = await query<DbRoadmap>(
      `SELECT r.*,
              CASE
                WHEN r.owner_id = $2 THEN 'owner'
                WHEN c.permission IS NOT NULL THEN c.permission
                WHEN r.is_public THEN 'view'
                ELSE NULL
              END as permission,
              u.email as owner_email, u.name as owner_name
       FROM roadmaps r
       LEFT JOIN collaborators c ON c.roadmap_id = r.id AND c.user_id = $2
       LEFT JOIN users u ON u.id = r.owner_id
       WHERE r.id = $1`,
      [req.params.id, req.user?.userId || null]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Roadmap not found' });
      return;
    }

    const row = result.rows[0];
    if (!row.permission) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ roadmap: mapDbToRoadmap(row) });
  } catch (err) {
    console.error('Get roadmap error:', err);
    res.status(500).json({ error: 'Failed to get roadmap' });
  }
});

// PUT /api/roadmaps/:id - Update roadmap
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = updateRoadmapSchema.parse(req.body);

    // Check access
    const access = await query<{ permission: string }>(
      `SELECT CASE
         WHEN r.owner_id = $2 THEN 'owner'
         ELSE c.permission
       END as permission
       FROM roadmaps r
       LEFT JOIN collaborators c ON c.roadmap_id = r.id AND c.user_id = $2
       WHERE r.id = $1`,
      [req.params.id, req.user!.userId]
    );

    if (access.rows.length === 0) {
      res.status(404).json({ error: 'Roadmap not found' });
      return;
    }

    const permission = access.rows[0].permission;
    if (permission !== 'owner' && permission !== 'edit') {
      res.status(403).json({ error: 'You do not have permission to edit this roadmap' });
      return;
    }

    const result = await query<DbRoadmap>(
      `UPDATE roadmaps SET
         title = COALESCE($2, title),
         entries = COALESCE($3, entries),
         theme_id = COALESCE($4, theme_id),
         orientation = COALESCE($5, orientation),
         font_size = COALESCE($6, font_size),
         entry_shape = COALESCE($7, entry_shape)
       WHERE id = $1
       RETURNING *`,
      [
        req.params.id,
        data.title,
        data.entries ? JSON.stringify(data.entries) : null,
        data.themeId,
        data.orientation,
        data.fontSize,
        data.entryShape,
      ]
    );

    const roadmap = mapDbToRoadmap(result.rows[0]);
    roadmap.permission = permission as Permission | 'owner';
    res.json({ roadmap });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error('Update roadmap error:', err);
    res.status(500).json({ error: 'Failed to update roadmap' });
  }
});

// DELETE /api/roadmaps/:id - Delete roadmap (owner only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'DELETE FROM roadmaps WHERE id = $1 AND owner_id = $2 RETURNING id',
      [req.params.id, req.user!.userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Roadmap not found or you are not the owner' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete roadmap error:', err);
    res.status(500).json({ error: 'Failed to delete roadmap' });
  }
});

// POST /api/roadmaps/:id/duplicate - Copy roadmap to user's account
router.post('/:id/duplicate', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get the source roadmap (must be accessible)
    const source = await query<DbRoadmap>(
      `SELECT r.* FROM roadmaps r
       LEFT JOIN collaborators c ON c.roadmap_id = r.id AND c.user_id = $2
       WHERE r.id = $1 AND (r.owner_id = $2 OR c.user_id = $2 OR r.is_public = true)`,
      [req.params.id, req.user!.userId]
    );

    if (source.rows.length === 0) {
      res.status(404).json({ error: 'Roadmap not found or access denied' });
      return;
    }

    const original = source.rows[0];

    // Create a copy
    const result = await query<DbRoadmap>(
      `INSERT INTO roadmaps (owner_id, title, entries, theme_id, orientation, font_size, entry_shape)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user!.userId,
        `${original.title} (Copy)`,
        JSON.stringify(original.entries),
        original.theme_id,
        original.orientation,
        original.font_size,
        original.entry_shape,
      ]
    );

    const roadmap = mapDbToRoadmap(result.rows[0]);
    roadmap.permission = 'owner';
    res.status(201).json({ roadmap });
  } catch (err) {
    console.error('Duplicate roadmap error:', err);
    res.status(500).json({ error: 'Failed to duplicate roadmap' });
  }
});

// PATCH /api/roadmaps/:id/visibility - Toggle public/private
router.patch('/:id/visibility', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      res.status(400).json({ error: 'isPublic must be a boolean' });
      return;
    }

    const result = await query<DbRoadmap>(
      `UPDATE roadmaps SET is_public = $2
       WHERE id = $1 AND owner_id = $3
       RETURNING *`,
      [req.params.id, isPublic, req.user!.userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Roadmap not found or you are not the owner' });
      return;
    }

    const roadmap = mapDbToRoadmap(result.rows[0]);
    roadmap.permission = 'owner';
    res.json({ roadmap });
  } catch (err) {
    console.error('Update visibility error:', err);
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

// POST /api/roadmaps/:id/share-token - Generate share token
router.post('/:id/share-token', authMiddleware, async (req: Request, res: Response) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');

    const result = await query<DbRoadmap>(
      `UPDATE roadmaps SET share_token = $2
       WHERE id = $1 AND owner_id = $3
       RETURNING *`,
      [req.params.id, token, req.user!.userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Roadmap not found or you are not the owner' });
      return;
    }

    const roadmap = mapDbToRoadmap(result.rows[0]);
    roadmap.permission = 'owner';
    res.json({ roadmap, shareToken: token });
  } catch (err) {
    console.error('Generate share token error:', err);
    res.status(500).json({ error: 'Failed to generate share token' });
  }
});

// DELETE /api/roadmaps/:id/share-token - Revoke share token
router.delete('/:id/share-token', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query<DbRoadmap>(
      `UPDATE roadmaps SET share_token = NULL
       WHERE id = $1 AND owner_id = $2
       RETURNING *`,
      [req.params.id, req.user!.userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Roadmap not found or you are not the owner' });
      return;
    }

    const roadmap = mapDbToRoadmap(result.rows[0]);
    roadmap.permission = 'owner';
    res.json({ roadmap });
  } catch (err) {
    console.error('Revoke share token error:', err);
    res.status(500).json({ error: 'Failed to revoke share token' });
  }
});

export default router;

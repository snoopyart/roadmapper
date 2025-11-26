import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import type { Collaborator, User, Permission } from '../types/index.js';

const router = Router();

const inviteSchema = z.object({
  email: z.string().email(),
  permission: z.enum(['view', 'edit']),
});

interface DbCollaborator {
  id: string;
  roadmap_id: string;
  user_id: string;
  permission: Permission;
  invited_at: Date;
  email?: string;
  name?: string;
}

function mapDbToCollaborator(row: DbCollaborator): Collaborator & { user: User } {
  return {
    id: row.id,
    roadmapId: row.roadmap_id,
    userId: row.user_id,
    permission: row.permission,
    invitedAt: row.invited_at,
    user: {
      id: row.user_id,
      email: row.email || '',
      name: row.name || null,
      createdAt: row.invited_at,
      updatedAt: row.invited_at,
    },
  };
}

// Middleware to check if user is owner of the roadmap
async function requireOwner(req: Request, res: Response, next: () => void) {
  const result = await query<{ owner_id: string }>(
    'SELECT owner_id FROM roadmaps WHERE id = $1',
    [req.params.roadmapId]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Roadmap not found' });
    return;
  }

  if (result.rows[0].owner_id !== req.user!.userId) {
    res.status(403).json({ error: 'Only the owner can manage collaborators' });
    return;
  }

  next();
}

// GET /api/roadmaps/:roadmapId/collaborators - List collaborators
router.get('/:roadmapId/collaborators', authMiddleware, requireOwner, async (req: Request, res: Response) => {
  try {
    const result = await query<DbCollaborator>(
      `SELECT c.*, u.email, u.name
       FROM collaborators c
       JOIN users u ON u.id = c.user_id
       WHERE c.roadmap_id = $1
       ORDER BY c.invited_at DESC`,
      [req.params.roadmapId]
    );

    res.json({ collaborators: result.rows.map(mapDbToCollaborator) });
  } catch (err) {
    console.error('List collaborators error:', err);
    res.status(500).json({ error: 'Failed to list collaborators' });
  }
});

// POST /api/roadmaps/:roadmapId/collaborators - Invite collaborator
router.post('/:roadmapId/collaborators', authMiddleware, requireOwner, async (req: Request, res: Response) => {
  try {
    const data = inviteSchema.parse(req.body);

    // Find user by email
    const userResult = await query<{ id: string; email: string; name: string }>(
      'SELECT id, email, name FROM users WHERE email = $1',
      [data.email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found. They need to register first.' });
      return;
    }

    const invitedUser = userResult.rows[0];

    // Can't invite yourself
    if (invitedUser.id === req.user!.userId) {
      res.status(400).json({ error: 'You cannot invite yourself' });
      return;
    }

    // Check if already a collaborator
    const existing = await query(
      'SELECT id FROM collaborators WHERE roadmap_id = $1 AND user_id = $2',
      [req.params.roadmapId, invitedUser.id]
    );

    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'User is already a collaborator' });
      return;
    }

    // Add collaborator
    const result = await query<DbCollaborator>(
      `INSERT INTO collaborators (roadmap_id, user_id, permission)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.roadmapId, invitedUser.id, data.permission]
    );

    const collaborator = mapDbToCollaborator({
      ...result.rows[0],
      email: invitedUser.email,
      name: invitedUser.name,
    });

    res.status(201).json({ collaborator });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error('Invite collaborator error:', err);
    res.status(500).json({ error: 'Failed to invite collaborator' });
  }
});

// PATCH /api/roadmaps/:roadmapId/collaborators/:userId - Update permission
router.patch('/:roadmapId/collaborators/:userId', authMiddleware, requireOwner, async (req: Request, res: Response) => {
  try {
    const { permission } = req.body;

    if (permission !== 'view' && permission !== 'edit') {
      res.status(400).json({ error: 'Permission must be "view" or "edit"' });
      return;
    }

    const result = await query<DbCollaborator>(
      `UPDATE collaborators SET permission = $3
       WHERE roadmap_id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.roadmapId, req.params.userId, permission]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Collaborator not found' });
      return;
    }

    // Get user info
    const userResult = await query<{ email: string; name: string }>(
      'SELECT email, name FROM users WHERE id = $1',
      [req.params.userId]
    );

    const collaborator = mapDbToCollaborator({
      ...result.rows[0],
      email: userResult.rows[0]?.email,
      name: userResult.rows[0]?.name,
    });

    res.json({ collaborator });
  } catch (err) {
    console.error('Update collaborator error:', err);
    res.status(500).json({ error: 'Failed to update collaborator' });
  }
});

// DELETE /api/roadmaps/:roadmapId/collaborators/:userId - Remove collaborator
router.delete('/:roadmapId/collaborators/:userId', authMiddleware, requireOwner, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'DELETE FROM collaborators WHERE roadmap_id = $1 AND user_id = $2 RETURNING id',
      [req.params.roadmapId, req.params.userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Collaborator not found' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Remove collaborator error:', err);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

export default router;

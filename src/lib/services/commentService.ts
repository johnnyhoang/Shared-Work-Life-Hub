import { db } from '../db';
import { Comment, EntityType, UserId } from '@/types';
import { recordActivity } from './activityService';

export function getComments(entityType: EntityType, entityId: string): Comment[] {
  const stmt = db.prepare(`
    SELECT 
      c.*,
      u.name as user_name,
      u.avatar as user_avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.entity_type = ? AND c.entity_id = ?
    ORDER BY c.created_at ASC
  `);
  return stmt.all(entityType, entityId) as Comment[];
}

export function addComment(params: {
  entity_type: EntityType;
  entity_id: string;
  user_id: UserId;
  content: string;
}): Comment {
  const id = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO comments (id, entity_type, entity_id, user_id, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    params.entity_type,
    params.entity_id,
    params.user_id,
    params.content.trim(),
    now
  );

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(params.user_id) as { name: string } || { name: 'User' };

  // Find entity project if any
  let projectId: string | null = null;
  let entityTitle = '';
  if (params.entity_type === 'task') {
    const t = db.prepare('SELECT title, project_id FROM tasks WHERE id = ?').get(params.entity_id) as { title: string; project_id: string | null } | undefined;
    if (t) {
      projectId = t.project_id;
      entityTitle = t.title;
    }
  } else if (params.entity_type === 'project') {
    projectId = params.entity_id;
    const p = db.prepare('SELECT name FROM projects WHERE id = ?').get(params.entity_id) as { name: string } | undefined;
    if (p) entityTitle = p.name;
  }

  recordActivity({
    actor_id: params.user_id,
    entity_type: 'comment',
    entity_id: id,
    action_type: 'commented',
    summary: `${actor.name} commented on ${params.entity_type} "${entityTitle || 'item'}"`,
    details: params.content.trim(),
    project_id: projectId,
  });

  const getStmt = db.prepare(`
    SELECT c.*, u.name as user_name, u.avatar as user_avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `);
  return getStmt.get(id) as Comment;
}

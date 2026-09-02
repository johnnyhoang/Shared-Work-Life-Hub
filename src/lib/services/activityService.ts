import { db } from '../db';
import { Activity, ActionType, EntityType, UserId } from '@/types';

export function recordActivity(params: {
  actor_id: UserId;
  target_user_id?: UserId | null;
  entity_type: EntityType;
  entity_id: string;
  action_type: ActionType;
  summary: string;
  details?: string;
  project_id?: string | null;
}): Activity {
  const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO activities (id, actor_id, target_user_id, entity_type, entity_id, action_type, summary, details, project_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    params.actor_id,
    params.target_user_id || null,
    params.entity_type,
    params.entity_id,
    params.action_type,
    params.summary,
    params.details || '',
    params.project_id || null,
    now
  );

  return {
    id,
    actor_id: params.actor_id,
    target_user_id: params.target_user_id || null,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    action_type: params.action_type,
    summary: params.summary,
    details: params.details || '',
    project_id: params.project_id || null,
    created_at: now,
  };
}

export function getActivities(options?: {
  limit?: number;
  actor_id?: string;
  entity_type?: string;
  project_id?: string;
  since?: string;
}): Activity[] {
  let query = `
    SELECT 
      a.*,
      u1.name as actor_name,
      u1.avatar as actor_avatar,
      u2.name as target_user_name,
      p.name as project_name
    FROM activities a
    LEFT JOIN users u1 ON a.actor_id = u1.id
    LEFT JOIN users u2 ON a.target_user_id = u2.id
    LEFT JOIN projects p ON a.project_id = p.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (options?.actor_id) {
    query += ' AND a.actor_id = ?';
    params.push(options.actor_id);
  }

  if (options?.entity_type) {
    query += ' AND a.entity_type = ?';
    params.push(options.entity_type);
  }

  if (options?.project_id) {
    query += ' AND a.project_id = ?';
    params.push(options.project_id);
  }

  if (options?.since) {
    query += ' AND a.created_at >= ?';
    params.push(options.since);
  }

  query += ' ORDER BY a.created_at DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params) as Activity[];
}

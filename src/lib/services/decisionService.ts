import { db } from '../db';
import { Decision, UserId } from '@/types';
import { recordActivity } from './activityService';

export function getDecisions(options?: { project_id?: string }): Decision[] {
  let query = `
    SELECT 
      d.*,
      p.name as project_name,
      u.name as author_name
    FROM decisions d
    LEFT JOIN projects p ON d.project_id = p.id
    LEFT JOIN users u ON d.created_by_id = u.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (options?.project_id) {
    query += ' AND d.project_id = ?';
    params.push(options.project_id);
  }

  query += ' ORDER BY d.created_at DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params) as Decision[];
}

export function createDecision(params: {
  title: string;
  reason: string;
  project_id?: string | null;
  created_by_id: UserId;
}): Decision {
  const id = `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO decisions (id, title, reason, project_id, created_by_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    params.title.trim(),
    params.reason.trim(),
    params.project_id || null,
    params.created_by_id,
    now
  );

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(params.created_by_id) as { name: string } || { name: 'User' };

  recordActivity({
    actor_id: params.created_by_id,
    entity_type: 'decision',
    entity_id: id,
    action_type: 'decided',
    summary: `${actor.name} recorded decision: "${params.title.trim()}"`,
    details: params.reason.trim(),
    project_id: params.project_id || null,
  });

  const getStmt = db.prepare(`
    SELECT d.*, p.name as project_name, u.name as author_name
    FROM decisions d
    LEFT JOIN projects p ON d.project_id = p.id
    LEFT JOIN users u ON d.created_by_id = u.id
    WHERE d.id = ?
  `);
  return getStmt.get(id) as Decision;
}

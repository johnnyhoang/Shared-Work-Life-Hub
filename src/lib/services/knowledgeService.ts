import { db } from '../db';
import { Knowledge, KnowledgeStatus, UserId } from '@/types';
import { recordActivity } from './activityService';

export function getKnowledgeList(options?: { status?: KnowledgeStatus; project_id?: string }): Knowledge[] {
  let query = `
    SELECT 
      k.*,
      p.name as project_name,
      u.name as user_name
    FROM knowledge k
    LEFT JOIN projects p ON k.project_id = p.id
    LEFT JOIN users u ON k.user_id = u.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (options?.status) {
    query += ' AND k.status = ?';
    params.push(options.status);
  }

  if (options?.project_id) {
    query += ' AND k.project_id = ?';
    params.push(options.project_id);
  }

  query += ` ORDER BY 
    CASE k.status
      WHEN 'learning' THEN 1
      WHEN 'to_learn' THEN 2
      WHEN 'mastered' THEN 3
    END,
    k.updated_at DESC
  `;

  const stmt = db.prepare(query);
  return stmt.all(...params) as Knowledge[];
}

export function createKnowledge(params: {
  topic: string;
  notes?: string;
  status?: KnowledgeStatus;
  project_id?: string | null;
  user_id: UserId;
}): Knowledge {
  const id = `knw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const status = params.status || 'to_learn';

  const stmt = db.prepare(`
    INSERT INTO knowledge (id, topic, notes, status, project_id, user_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    params.topic.trim(),
    params.notes?.trim() || '',
    status,
    params.project_id || null,
    params.user_id,
    now,
    now
  );

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(params.user_id) as { name: string } || { name: 'User' };

  recordActivity({
    actor_id: params.user_id,
    entity_type: 'knowledge',
    entity_id: id,
    action_type: 'created',
    summary: `${actor.name} added learning topic "${params.topic.trim()}"`,
    details: params.notes?.trim() || '',
    project_id: params.project_id || null,
  });

  const getStmt = db.prepare(`
    SELECT k.*, p.name as project_name, u.name as user_name
    FROM knowledge k
    LEFT JOIN projects p ON k.project_id = p.id
    LEFT JOIN users u ON k.user_id = u.id
    WHERE k.id = ?
  `);
  return getStmt.get(id) as Knowledge;
}

export function updateKnowledge(
  id: string,
  updates: Partial<Pick<Knowledge, 'topic' | 'notes' | 'status' | 'project_id'>>,
  actorId: UserId
): Knowledge | null {
  const now = new Date().toISOString();
  const fields: string[] = ['updated_at = ?'];
  const values: unknown[] = [now];

  if (updates.topic !== undefined) {
    fields.push('topic = ?');
    values.push(updates.topic.trim());
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes.trim());
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.project_id !== undefined) {
    fields.push('project_id = ?');
    values.push(updates.project_id || null);
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE knowledge
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  stmt.run(...values);

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(actorId) as { name: string } || { name: 'User' };

  const getStmt = db.prepare(`
    SELECT k.*, p.name as project_name, u.name as user_name
    FROM knowledge k
    LEFT JOIN projects p ON k.project_id = p.id
    LEFT JOIN users u ON k.user_id = u.id
    WHERE k.id = ?
  `);
  const updated = getStmt.get(id) as Knowledge | undefined;
  if (!updated) return null;

  recordActivity({
    actor_id: actorId,
    entity_type: 'knowledge',
    entity_id: id,
    action_type: updates.status === 'mastered' ? 'completed' : 'updated',
    summary: `${actor.name} updated knowledge "${updated.topic}" (${updated.status})`,
    project_id: updated.project_id,
  });

  return updated;
}

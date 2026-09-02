import { db } from '../db';
import { Idea, IdeaStatus, UserId } from '@/types';
import { recordActivity } from './activityService';
import { createTask } from './taskService';

export function getIdeas(options?: { status?: IdeaStatus; project_id?: string }): Idea[] {
  let query = `
    SELECT 
      i.*,
      p.name as project_name,
      u.name as creator_name
    FROM ideas i
    LEFT JOIN projects p ON i.project_id = p.id
    LEFT JOIN users u ON i.creator_id = u.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (options?.status) {
    query += ' AND i.status = ?';
    params.push(options.status);
  }

  if (options?.project_id) {
    query += ' AND i.project_id = ?';
    params.push(options.project_id);
  }

  query += ` ORDER BY 
    CASE i.status
      WHEN 'idea' THEN 1
      WHEN 'maybe' THEN 2
      WHEN 'planned' THEN 3
      WHEN 'converted' THEN 4
    END,
    i.updated_at DESC
  `;

  const stmt = db.prepare(query);
  return stmt.all(...params) as Idea[];
}

export function getIdeaById(id: string): Idea | null {
  const stmt = db.prepare(`
    SELECT 
      i.*,
      p.name as project_name,
      u.name as creator_name
    FROM ideas i
    LEFT JOIN projects p ON i.project_id = p.id
    LEFT JOIN users u ON i.creator_id = u.id
    WHERE i.id = ?
  `);
  const result = stmt.get(id) as Idea | undefined;
  return result || null;
}

export function createIdea(params: {
  title: string;
  description?: string;
  project_id?: string | null;
  creator_id: UserId;
  status?: IdeaStatus;
}): Idea {
  const id = `idea_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const status = params.status || 'idea';

  const stmt = db.prepare(`
    INSERT INTO ideas (id, title, description, status, project_id, creator_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    params.title.trim(),
    params.description?.trim() || '',
    status,
    params.project_id || null,
    params.creator_id,
    now,
    now
  );

  const creator = db.prepare('SELECT name FROM users WHERE id = ?').get(params.creator_id) as { name: string } || { name: 'User' };

  recordActivity({
    actor_id: params.creator_id,
    entity_type: 'idea',
    entity_id: id,
    action_type: 'created',
    summary: `${creator.name} added idea "${params.title.trim()}"`,
    details: params.description?.trim() || '',
    project_id: params.project_id || null,
  });

  return getIdeaById(id)!;
}

export function updateIdea(
  id: string,
  updates: Partial<Pick<Idea, 'title' | 'description' | 'status' | 'project_id'>>,
  actorId: UserId
): Idea | null {
  const existing = getIdeaById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const fields: string[] = ['updated_at = ?'];
  const values: unknown[] = [now];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title.trim());
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description.trim());
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
    UPDATE ideas
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  stmt.run(...values);

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(actorId) as { name: string } || { name: 'User' };
  const updatedIdea = getIdeaById(id)!;

  recordActivity({
    actor_id: actorId,
    entity_type: 'idea',
    entity_id: id,
    action_type: updates.status !== undefined && updates.status !== existing.status ? 'status_changed' : 'updated',
    summary: `${actor.name} updated idea "${updatedIdea.title}" (${updatedIdea.status})`,
    project_id: updatedIdea.project_id,
  });

  return updatedIdea;
}

export function convertIdeaToTask(
  ideaId: string,
  params: {
    assignee_id: UserId;
    actor_id: UserId;
  }
) {
  const idea = getIdeaById(ideaId);
  if (!idea) return null;

  // Mark idea as converted
  updateIdea(ideaId, { status: 'converted' }, params.actor_id);

  // Create task
  const task = createTask({
    title: idea.title,
    description: idea.description,
    project_id: idea.project_id,
    creator_id: params.actor_id,
    assignee_id: params.assignee_id,
    priority: 'medium',
    status: 'todo',
  });

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(params.actor_id) as { name: string } || { name: 'User' };

  recordActivity({
    actor_id: params.actor_id,
    target_user_id: params.assignee_id !== params.actor_id ? params.assignee_id : null,
    entity_type: 'idea',
    entity_id: ideaId,
    action_type: 'converted',
    summary: `${actor.name} converted idea "${idea.title}" into a task`,
    project_id: idea.project_id,
  });

  return task;
}

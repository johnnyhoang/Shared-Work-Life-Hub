import { db } from '../db';
import { Project, ProjectStatus, UserId } from '@/types';
import { recordActivity } from './activityService';

export function getProjects(options?: { status?: ProjectStatus }): Project[] {
  let query = `
    SELECT 
      p.*,
      COUNT(t.id) as total_tasks,
      SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN t.status != 'done' THEN 1 ELSE 0 END) as active_tasks
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (options?.status) {
    query += ' AND p.status = ?';
    params.push(options.status);
  }

  query += ' GROUP BY p.id ORDER BY p.updated_at DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params) as Project[];
}

export function getProjectById(id: string): Project | null {
  const stmt = db.prepare(`
    SELECT 
      p.*,
      COUNT(t.id) as total_tasks,
      SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN t.status != 'done' THEN 1 ELSE 0 END) as active_tasks
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    WHERE p.id = ?
    GROUP BY p.id
  `);
  const result = stmt.get(id) as Project | undefined;
  return result || null;
}

export function createProject(params: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: ProjectStatus;
  actor_id: UserId;
}): Project {
  const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const color = params.color || '#3b82f6';
  const icon = params.icon || 'folder';
  const status = params.status || 'active';

  const stmt = db.prepare(`
    INSERT INTO projects (id, name, description, color, icon, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    params.name.trim(),
    params.description?.trim() || '',
    color,
    icon,
    status,
    now,
    now
  );

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(params.actor_id) as { name: string } || { name: 'User' };

  recordActivity({
    actor_id: params.actor_id,
    entity_type: 'project',
    entity_id: id,
    action_type: 'created',
    summary: `${actor.name} created project "${params.name.trim()}"`,
    details: params.description?.trim() || '',
    project_id: id,
  });

  return getProjectById(id)!;
}

export function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'color' | 'icon' | 'status'>>,
  actorId: UserId
): Project | null {
  const existing = getProjectById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const fields: string[] = ['updated_at = ?'];
  const values: unknown[] = [now];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name.trim());
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description.trim());
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  if (updates.icon !== undefined) {
    fields.push('icon = ?');
    values.push(updates.icon);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE projects
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  stmt.run(...values);

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(actorId) as { name: string } || { name: 'User' };
  const updatedProject = getProjectById(id)!;

  recordActivity({
    actor_id: actorId,
    entity_type: 'project',
    entity_id: id,
    action_type: 'updated',
    summary: `${actor.name} updated project "${updatedProject.name}"`,
    project_id: id,
  });

  return updatedProject;
}

import { db } from '../db';
import { Task, TaskPriority, TaskStatus, UserId } from '@/types';
import { recordActivity } from './activityService';

export function getTasks(options?: {
  assignee_id?: string;
  creator_id?: string;
  status?: string;
  project_id?: string;
}): Task[] {
  let query = `
    SELECT 
      t.*,
      p.name as project_name,
      p.color as project_color,
      u1.name as creator_name,
      u2.name as assignee_name,
      (SELECT COUNT(*) FROM comments c WHERE c.entity_type = 'task' AND c.entity_id = t.id) as comment_count
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u1 ON t.creator_id = u1.id
    LEFT JOIN users u2 ON t.assignee_id = u2.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (options?.assignee_id) {
    query += ' AND t.assignee_id = ?';
    params.push(options.assignee_id);
  }

  if (options?.creator_id) {
    query += ' AND t.creator_id = ?';
    params.push(options.creator_id);
  }

  if (options?.status) {
    query += ' AND t.status = ?';
    params.push(options.status);
  }

  if (options?.project_id) {
    query += ' AND t.project_id = ?';
    params.push(options.project_id);
  }

  query += ` ORDER BY 
    CASE t.status 
      WHEN 'in_progress' THEN 1 
      WHEN 'todo' THEN 2 
      WHEN 'inbox' THEN 3 
      WHEN 'done' THEN 4 
    END,
    CASE t.priority 
      WHEN 'urgent' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'medium' THEN 3 
      WHEN 'low' THEN 4 
    END,
    t.due_date ASC NULLS LAST,
    t.updated_at DESC
  `;

  const stmt = db.prepare(query);
  return stmt.all(...params) as Task[];
}

export function getTaskById(id: string): Task | null {
  const stmt = db.prepare(`
    SELECT 
      t.*,
      p.name as project_name,
      p.color as project_color,
      u1.name as creator_name,
      u2.name as assignee_name,
      (SELECT COUNT(*) FROM comments c WHERE c.entity_type = 'task' AND c.entity_id = t.id) as comment_count
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u1 ON t.creator_id = u1.id
    LEFT JOIN users u2 ON t.assignee_id = u2.id
    WHERE t.id = ?
  `);
  const result = stmt.get(id) as Task | undefined;
  return result || null;
}

export function createTask(params: {
  title: string;
  description?: string;
  project_id?: string | null;
  creator_id: UserId;
  assignee_id: UserId;
  priority?: TaskPriority;
  due_date?: string | null;
  status?: TaskStatus;
}): Task {
  const id = `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const priority = params.priority || 'medium';
  const status = params.status || 'todo';

  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, project_id, creator_id, assignee_id, status, priority, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    params.title.trim(),
    params.description?.trim() || '',
    params.project_id || null,
    params.creator_id,
    params.assignee_id,
    status,
    priority,
    params.due_date || null,
    now,
    now
  );

  const creator = db.prepare('SELECT name FROM users WHERE id = ?').get(params.creator_id) as { name: string };
  const assignee = db.prepare('SELECT name FROM users WHERE id = ?').get(params.assignee_id) as { name: string };

  const isAssignedToOther = params.creator_id !== params.assignee_id;
  const summary = isAssignedToOther
    ? `${creator.name} assigned "${params.title}" to ${assignee.name}`
    : `${creator.name} created task "${params.title}"`;

  recordActivity({
    actor_id: params.creator_id,
    target_user_id: isAssignedToOther ? params.assignee_id : null,
    entity_type: 'task',
    entity_id: id,
    action_type: isAssignedToOther ? 'assigned' : 'created',
    summary,
    details: params.description || '',
    project_id: params.project_id || null,
  });

  return getTaskById(id)!;
}

export function updateTask(
  id: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'project_id' | 'assignee_id' | 'status' | 'priority' | 'due_date'>>,
  actorId: UserId
): Task | null {
  const existing = getTaskById(id);
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
  if (updates.project_id !== undefined) {
    fields.push('project_id = ?');
    values.push(updates.project_id || null);
  }
  if (updates.assignee_id !== undefined) {
    fields.push('assignee_id = ?');
    values.push(updates.assignee_id);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updates.priority);
  }
  if (updates.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(updates.due_date || null);
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE tasks 
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  stmt.run(...values);

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(actorId) as { name: string } || { name: 'User' };
  const updatedTask = getTaskById(id)!;

  // Generate activities for significant actions
  if (updates.status !== undefined && updates.status !== existing.status) {
    if (updates.status === 'done') {
      recordActivity({
        actor_id: actorId,
        entity_type: 'task',
        entity_id: id,
        action_type: 'completed',
        summary: `${actor.name} completed "${updatedTask.title}"`,
        project_id: updatedTask.project_id,
      });
    } else {
      recordActivity({
        actor_id: actorId,
        entity_type: 'task',
        entity_id: id,
        action_type: 'status_changed',
        summary: `${actor.name} moved "${updatedTask.title}" to ${updates.status.replace('_', ' ')}`,
        project_id: updatedTask.project_id,
      });
    }
  } else if (updates.assignee_id !== undefined && updates.assignee_id !== existing.assignee_id) {
    const newAssignee = db.prepare('SELECT name FROM users WHERE id = ?').get(updates.assignee_id) as { name: string };
    recordActivity({
      actor_id: actorId,
      target_user_id: updates.assignee_id,
      entity_type: 'task',
      entity_id: id,
      action_type: 'assigned',
      summary: `${actor.name} reassigned "${updatedTask.title}" to ${newAssignee.name}`,
      project_id: updatedTask.project_id,
    });
  } else {
    recordActivity({
      actor_id: actorId,
      entity_type: 'task',
      entity_id: id,
      action_type: 'updated',
      summary: `${actor.name} updated task "${updatedTask.title}"`,
      project_id: updatedTask.project_id,
    });
  }

  return updatedTask;
}

export function deleteTask(id: string, actorId: UserId): boolean {
  const existing = getTaskById(id);
  if (!existing) return false;

  const actor = db.prepare('SELECT name FROM users WHERE id = ?').get(actorId) as { name: string } || { name: 'User' };

  db.prepare('DELETE FROM comments WHERE entity_type = ? AND entity_id = ?').run('task', id);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

  recordActivity({
    actor_id: actorId,
    entity_type: 'task',
    entity_id: id,
    action_type: 'updated',
    summary: `${actor.name} deleted task "${existing.title}"`,
    project_id: existing.project_id,
  });

  return true;
}

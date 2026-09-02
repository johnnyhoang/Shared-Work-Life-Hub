import { createClient } from '@/lib/supabase/server';
import {
  Task,
  Project,
  Idea,
  Knowledge,
  Decision,
  Comment,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  IdeaStatus,
  KnowledgeStatus,
  EntityType,
} from '@/types';

export async function createSupabaseTask(params: {
  title: string;
  description?: string;
  project_id?: string | null;
  creator_id: string;
  assignee_id: string;
  priority?: TaskPriority;
  due_date?: string | null;
  status?: TaskStatus;
}) {
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from('sw_tasks')
    .insert({
      title: params.title.trim(),
      description: params.description?.trim() || '',
      project_id: params.project_id || null,
      creator_id: params.creator_id,
      assignee_id: params.assignee_id,
      priority: params.priority || 'medium',
      status: params.status || 'todo',
      due_date: params.due_date || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  const isAssignedToOther = params.creator_id !== params.assignee_id;
  await supabase.from('sw_activities').insert({
    actor_id: params.creator_id,
    target_user_id: isAssignedToOther ? params.assignee_id : null,
    entity_type: 'task',
    entity_id: task.id,
    action_type: isAssignedToOther ? 'assigned' : 'created',
    summary: `Created task "${params.title.trim()}"`,
    details: params.description || '',
    project_id: params.project_id || null,
  });

  return task;
}

export async function updateSupabaseTask(id: string, updates: Partial<Task>, actorId: string) {
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from('sw_tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (updates.status === 'done') {
    await supabase.from('sw_activities').insert({
      actor_id: actorId,
      entity_type: 'task',
      entity_id: id,
      action_type: 'completed',
      summary: `Completed "${task.title}"`,
      project_id: task.project_id,
    });
  }

  return task;
}

export async function deleteSupabaseTask(id: string, actorId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sw_tasks').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function createSupabaseProject(params: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: ProjectStatus;
  actor_id: string;
}) {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from('sw_projects')
    .insert({
      name: params.name.trim(),
      description: params.description?.trim() || '',
      color: params.color || '#3b82f6',
      icon: params.icon || 'folder',
      status: params.status || 'active',
      created_by: params.actor_id,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('sw_activities').insert({
    actor_id: params.actor_id,
    entity_type: 'project',
    entity_id: project.id,
    action_type: 'created',
    summary: `Created project "${project.name}"`,
    project_id: project.id,
  });

  return project;
}

export async function createSupabaseIdea(params: {
  title: string;
  description?: string;
  project_id?: string | null;
  creator_id: string;
  status?: IdeaStatus;
}) {
  const supabase = await createClient();
  const { data: idea, error } = await supabase
    .from('sw_ideas')
    .insert({
      title: params.title.trim(),
      description: params.description?.trim() || '',
      project_id: params.project_id || null,
      creator_id: params.creator_id,
      status: params.status || 'idea',
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('sw_activities').insert({
    actor_id: params.creator_id,
    entity_type: 'idea',
    entity_id: idea.id,
    action_type: 'created',
    summary: `Added idea "${idea.title}"`,
    project_id: params.project_id || null,
  });

  return idea;
}

export async function createSupabaseKnowledge(params: {
  topic: string;
  notes?: string;
  status?: KnowledgeStatus;
  project_id?: string | null;
  user_id: string;
}) {
  const supabase = await createClient();
  const { data: knowledge, error } = await supabase
    .from('sw_knowledge')
    .insert({
      topic: params.topic.trim(),
      notes: params.notes?.trim() || '',
      status: params.status || 'to_learn',
      project_id: params.project_id || null,
      user_id: params.user_id,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('sw_activities').insert({
    actor_id: params.user_id,
    entity_type: 'knowledge',
    entity_id: knowledge.id,
    action_type: 'created',
    summary: `Added learning topic "${knowledge.topic}"`,
    project_id: params.project_id || null,
  });

  return knowledge;
}

export async function createSupabaseDecision(params: {
  title: string;
  reason: string;
  project_id?: string | null;
  created_by_id: string;
}) {
  const supabase = await createClient();
  const { data: decision, error } = await supabase
    .from('sw_decisions')
    .insert({
      title: params.title.trim(),
      reason: params.reason.trim(),
      project_id: params.project_id || null,
      created_by_id: params.created_by_id,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('sw_activities').insert({
    actor_id: params.created_by_id,
    entity_type: 'decision',
    entity_id: decision.id,
    action_type: 'decided',
    summary: `Recorded decision: "${decision.title}"`,
    details: decision.reason,
    project_id: params.project_id || null,
  });

  return decision;
}

export async function addSupabaseComment(params: {
  entity_type: EntityType;
  entity_id: string;
  user_id: string;
  content: string;
}) {
  const supabase = await createClient();
  const { data: comment, error } = await supabase
    .from('sw_comments')
    .insert({
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      user_id: params.user_id,
      content: params.content.trim(),
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('sw_activities').insert({
    actor_id: params.user_id,
    entity_type: 'comment',
    entity_id: comment.id,
    action_type: 'commented',
    summary: `Commented on ${params.entity_type}`,
    details: params.content.trim(),
  });

  return comment;
}

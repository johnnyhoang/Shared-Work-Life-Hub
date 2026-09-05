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

// ==========================================
// TASKS
// ==========================================

export async function getSupabaseTasks(filter: {
  assignee_id?: string;
  creator_id?: string;
  status?: string;
  project_id?: string;
}) {
  const supabase = await createClient();
  let query = supabase.from('sw_tasks').select(`
    *,
    project:sw_projects(name, color),
    creator:sw_profiles!sw_tasks_creator_id_fkey(name),
    assignee:sw_profiles!sw_tasks_assignee_id_fkey(name),
    comments:sw_comments(id)
  `);

  if (filter.assignee_id) query = query.eq('assignee_id', filter.assignee_id);
  if (filter.creator_id) query = query.eq('creator_id', filter.creator_id);
  if (filter.status) query = query.eq('status', filter.status);
  if (filter.project_id) query = query.eq('project_id', filter.project_id);

  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    project_id: t.project_id,
    creator_id: t.creator_id,
    assignee_id: t.assignee_id,
    status: t.status,
    priority: t.priority,
    due_date: t.due_date,
    created_at: t.created_at,
    updated_at: t.updated_at,
    project_name: t.project?.name,
    project_color: t.project?.color,
    creator_name: t.creator?.name,
    assignee_name: t.assignee?.name,
    comment_count: t.comments?.length || 0,
  }));
}

export async function getSupabaseTaskById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sw_tasks')
    .select(`
      *,
      project:sw_projects(name, color),
      creator:sw_profiles!sw_tasks_creator_id_fkey(name),
      assignee:sw_profiles!sw_tasks_assignee_id_fkey(name),
      comments:sw_comments(id)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    project_id: data.project_id,
    creator_id: data.creator_id,
    assignee_id: data.assignee_id,
    status: data.status,
    priority: data.priority,
    due_date: data.due_date,
    created_at: data.created_at,
    updated_at: data.updated_at,
    project_name: data.project?.name,
    project_color: data.project?.color,
    creator_name: data.creator?.name,
    assignee_name: data.assignee?.name,
    comment_count: data.comments?.length || 0,
  };
}

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

export async function updateSupabaseTask(id: string, updates: Partial<Task>, actorId?: string) {
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

  if (updates.status === 'done' && actorId) {
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

export async function deleteSupabaseTask(id: string, actorId?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sw_tasks').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==========================================
// PROJECTS
// ==========================================

export async function getSupabaseProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sw_projects')
    .select('*, sw_tasks(id, status)')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((p: any) => {
    const pTasks = p.sw_tasks || [];
    const total = pTasks.length;
    const done = pTasks.filter((t: any) => t.status === 'done').length;
    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      color: p.color || '#3b82f6',
      icon: p.icon || 'folder',
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
      total_tasks: total,
      completed_tasks: done,
      active_tasks: total - done,
    };
  });
}

export async function getSupabaseProjectById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sw_projects')
    .select('*, sw_tasks(id, status)')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const pTasks = data.sw_tasks || [];
  const total = pTasks.length;
  const done = pTasks.filter((t: any) => t.status === 'done').length;
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    color: data.color || '#3b82f6',
    icon: data.icon || 'folder',
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    total_tasks: total,
    completed_tasks: done,
    active_tasks: total - done,
  };
}

export async function createSupabaseProject(params: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: ProjectStatus;
  actor_id?: string;
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
      created_by: params.actor_id || null,
    })
    .select()
    .single();

  if (error) throw error;

  if (params.actor_id) {
    await supabase.from('sw_activities').insert({
      actor_id: params.actor_id,
      entity_type: 'project',
      entity_id: project.id,
      action_type: 'created',
      summary: `Created project "${project.name}"`,
      project_id: project.id,
    });
  }

  return project;
}

export async function updateSupabaseProject(id: string, updates: Partial<Project>, actorId?: string) {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from('sw_projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return project;
}

export async function deleteSupabaseProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sw_projects').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==========================================
// IDEAS
// ==========================================

export async function getSupabaseIdeas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sw_ideas')
    .select('*, project:sw_projects(name), creator:sw_profiles(name)')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((i: any) => ({
    id: i.id,
    title: i.title,
    description: i.description || '',
    status: i.status,
    project_id: i.project_id,
    creator_id: i.creator_id,
    created_at: i.created_at,
    updated_at: i.updated_at,
    project_name: i.project?.name,
    creator_name: i.creator?.name,
  }));
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

export async function updateSupabaseIdea(id: string, updates: Partial<Idea>, actorId?: string) {
  const supabase = await createClient();
  const { data: idea, error } = await supabase
    .from('sw_ideas')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return idea;
}

export async function convertSupabaseIdea(id: string, assignee_id: string, actorId: string) {
  const supabase = await createClient();
  const { data: idea, error: ideaErr } = await supabase
    .from('sw_ideas')
    .select('*')
    .eq('id', id)
    .single();

  if (ideaErr || !idea) throw new Error('Idea not found');

  const task = await createSupabaseTask({
    title: idea.title,
    description: idea.description,
    project_id: idea.project_id,
    creator_id: actorId,
    assignee_id,
    priority: 'medium',
    status: 'todo',
  });

  await supabase
    .from('sw_ideas')
    .update({ status: 'converted', updated_at: new Date().toISOString() })
    .eq('id', id);

  return { idea, task };
}

// ==========================================
// KNOWLEDGE
// ==========================================

export async function getSupabaseKnowledge() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sw_knowledge')
    .select('*, project:sw_projects(name), user:sw_profiles(name)')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((k: any) => ({
    id: k.id,
    topic: k.topic,
    notes: k.notes || '',
    status: k.status,
    project_id: k.project_id,
    user_id: k.user_id,
    created_at: k.created_at,
    updated_at: k.updated_at,
    project_name: k.project?.name,
    user_name: k.user?.name,
  }));
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

export async function updateSupabaseKnowledge(id: string, updates: Partial<Knowledge>) {
  const supabase = await createClient();
  const { data: knowledge, error } = await supabase
    .from('sw_knowledge')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return knowledge;
}

// ==========================================
// DECISIONS
// ==========================================

export async function getSupabaseDecisions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sw_decisions')
    .select('*, project:sw_projects(name), author:sw_profiles(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    reason: d.reason || '',
    project_id: d.project_id,
    created_by_id: d.created_by_id,
    created_at: d.created_at,
    project_name: d.project?.name,
    author_name: d.author?.name,
  }));
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

// ==========================================
// COMMENTS & ACTIVITIES
// ==========================================

export async function getSupabaseComments(entity_type: EntityType, entity_id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sw_comments')
    .select('*, user:sw_profiles(name, avatar_url)')
    .eq('entity_type', entity_type)
    .eq('entity_id', entity_id)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((c: any) => ({
    id: c.id,
    entity_type: c.entity_type,
    entity_id: c.entity_id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    user_name: c.user?.name,
    user_avatar: c.user?.avatar_url || '👤',
  }));
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

export async function getSupabaseActivities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sw_activities')
    .select(`
      *,
      actor:sw_profiles!sw_activities_actor_id_fkey(name, avatar_url),
      target:sw_profiles!sw_activities_target_user_id_fkey(name),
      project:sw_projects(name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data || []).map((a: any) => ({
    id: a.id,
    actor_id: a.actor_id,
    target_user_id: a.target_user_id,
    entity_type: a.entity_type,
    entity_id: a.entity_id,
    action_type: a.action_type,
    summary: a.summary,
    details: a.details || '',
    project_id: a.project_id,
    created_at: a.created_at,
    actor_name: a.actor?.name,
    actor_avatar: a.actor?.avatar_url || '👤',
    target_user_name: a.target?.name,
    project_name: a.project?.name,
  }));
}

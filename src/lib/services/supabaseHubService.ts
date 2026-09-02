import { createClient } from '@/lib/supabase/server';
import {
  HubState,
  User,
  Project,
  Task,
  Idea,
  Knowledge,
  Decision,
  Activity,
  AttentionItem,
  WeeklyStats,
  UserRole,
} from '@/types';

export async function getSupabaseHubState(): Promise<HubState | null> {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Fetch all profiles (team members)
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (profileErr || !profiles || profiles.length === 0) {
    return null;
  }

  // Map profiles to User type
  const users: User[] = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar_url || '👤',
    avatar_url: p.avatar_url,
    email: p.email,
    role: (p.role as UserRole) || 'member',
    timezone: p.timezone || 'Asia/Ho_Chi_Minh',
    location: p.location || 'Vietnam',
    flag: p.flag || '🇻🇳',
    color: p.color || '#3b82f6',
    last_visited_at: p.last_visited_at || p.created_at,
  }));

  const currentUser = authUser
    ? users.find((u) => u.id === authUser.id) || users[0]
    : users[0];

  const partnerUser = users.find((u) => u.id !== currentUser.id) || currentUser;

  // 2. Fetch Projects
  const { data: rawProjects } = await supabase
    .from('projects')
    .select('*, tasks(id, status)')
    .order('updated_at', { ascending: false });

  const projects: Project[] = (rawProjects || []).map((p: any) => {
    const pTasks = p.tasks || [];
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

  // 3. Fetch Tasks
  const { data: rawTasks } = await supabase
    .from('tasks')
    .select(
      `
      *,
      project:projects(name, color),
      creator:profiles!tasks_creator_id_fkey(name),
      assignee:profiles!tasks_assignee_id_fkey(name),
      comments:comments(id)
    `
    )
    .order('updated_at', { ascending: false });

  const tasks: Task[] = (rawTasks || []).map((t: any) => ({
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

  // 4. Fetch Ideas
  const { data: rawIdeas } = await supabase
    .from('ideas')
    .select('*, project:projects(name), creator:profiles(name)')
    .order('updated_at', { ascending: false });

  const ideas: Idea[] = (rawIdeas || []).map((i: any) => ({
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

  // 5. Fetch Knowledge
  const { data: rawKnowledge } = await supabase
    .from('knowledge')
    .select('*, project:projects(name), user:profiles(name)')
    .order('updated_at', { ascending: false });

  const knowledge: Knowledge[] = (rawKnowledge || []).map((k: any) => ({
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

  // 6. Fetch Decisions
  const { data: rawDecisions } = await supabase
    .from('decisions')
    .select('*, project:projects(name), author:profiles(name)')
    .order('created_at', { ascending: false });

  const decisions: Decision[] = (rawDecisions || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    reason: d.reason || '',
    project_id: d.project_id,
    created_by_id: d.created_by_id,
    created_at: d.created_at,
    project_name: d.project?.name,
    author_name: d.author?.name,
  }));

  // 7. Fetch Activities
  const { data: rawActivities } = await supabase
    .from('activities')
    .select(
      `
      *,
      actor:profiles!activities_actor_id_fkey(name, avatar_url),
      target:profiles!activities_target_user_id_fkey(name),
      project:projects(name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(40);

  const recentActivities: Activity[] = (rawActivities || []).map((a: any) => ({
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

  // 8. Since Last Visit
  const sinceChanges = recentActivities.filter(
    (a) => new Date(a.created_at).getTime() > new Date(currentUser.last_visited_at).getTime()
  );

  const sinceLastVisit = {
    total_changes: sinceChanges.length,
    changes: sinceChanges,
  };

  // 9. Weekly Stats
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weeklyStats: WeeklyStats = {
    tasks_completed: recentActivities.filter(
      (a) => a.action_type === 'completed' && a.entity_type === 'task' && a.created_at >= oneWeekAgo
    ).length,
    tasks_created: tasks.filter((t) => t.created_at >= oneWeekAgo).length,
    ideas_added: ideas.filter((i) => i.created_at >= oneWeekAgo).length,
    project_updates: recentActivities.filter(
      (a) => a.entity_type === 'project' && a.created_at >= oneWeekAgo
    ).length,
    decisions_made: decisions.filter((d) => d.created_at >= oneWeekAgo).length,
  };

  // 10. Attention
  const todayStr = new Date().toISOString().split('T')[0];
  const myActionTasks = tasks.filter(
    (t) => t.assignee_id === currentUser.id && t.status !== 'done'
  );

  const actionRequired: AttentionItem[] = myActionTasks.map((task) => {
    let reason = 'Assigned to you';
    let severity: 'urgent' | 'high' | 'normal' = 'normal';

    if (task.priority === 'urgent') {
      severity = 'urgent';
      reason = 'Urgent priority';
    } else if (task.priority === 'high') {
      severity = 'high';
      reason = 'High priority';
    }

    if (task.due_date) {
      if (task.due_date < todayStr) {
        severity = 'urgent';
        reason = 'Overdue task';
      } else if (task.due_date === todayStr) {
        severity = 'high';
        reason = 'Due today';
      }
    }

    if (task.creator_id !== currentUser.id) {
      reason = `${task.creator_name || 'Team member'} assigned to you`;
    }

    return {
      type: 'action_required',
      task,
      reason,
      severity,
    };
  });

  const waitingTasks = tasks.filter(
    (t) => t.creator_id === currentUser.id && t.assignee_id !== currentUser.id && t.status !== 'done'
  );

  const waiting: AttentionItem[] = waitingTasks.map((task) => ({
    type: 'waiting',
    task,
    reason: `Waiting on ${task.assignee_name || 'Team'} (${task.status.replace('_', ' ')})`,
    severity: task.priority === 'urgent' ? 'urgent' : 'normal',
  }));

  return {
    currentUser,
    partnerUser,
    users,
    projects,
    tasks,
    ideas,
    knowledge,
    decisions,
    recentActivities,
    sinceLastVisit,
    weeklyStats,
    attention: {
      actionRequired,
      waiting,
    },
  };
}

export async function updateProfileRole(userId: string, role: UserRole) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

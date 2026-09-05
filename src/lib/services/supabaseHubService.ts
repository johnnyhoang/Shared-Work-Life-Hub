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
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
} from '@/types';

export async function getSupabaseHubState(requestedWorkspaceId?: string): Promise<HubState> {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Fetch all profiles from sw_profiles
  let { data: rawProfiles } = await supabase
    .from('sw_profiles')
    .select('*')
    .order('created_at', { ascending: true });

  let profiles = rawProfiles || [];

  // Ensure currently authenticated user has a profile
  let currentProfile = profiles.find((p) => p.id === authUser?.id);
  if (authUser && !currentProfile) {
    const isFirstUser = profiles.length === 0;
    const userName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split('@')[0] ||
      'Member';
    const userAvatar =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      '👤';

    currentProfile = {
      id: authUser.id,
      name: userName,
      avatar_url: userAvatar,
      email: authUser.email || '',
      role: 'member',
      timezone: 'Asia/Ho_Chi_Minh',
      location: 'Vietnam',
      flag: '🇻🇳',
      color: isFirstUser ? '#3b82f6' : '#10b981',
      last_visited_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await supabase.from('sw_profiles').upsert(currentProfile);
    profiles.push(currentProfile);
  }

  // 2. Fetch User Workspaces & Pending Invitations
  let userWorkspaces: Workspace[] = [];
  let pendingInvitations: WorkspaceInvitation[] = [];

  if (authUser) {
    // Check pending invitations for user's email
    if (authUser.email) {
      const { data: rawInvites } = await supabase
        .from('sw_workspace_invitations')
        .select(`
          *,
          workspace:sw_workspaces(name),
          inviter:sw_profiles!sw_workspace_invitations_invited_by_fkey(name)
        `)
        .ilike('email', authUser.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      pendingInvitations = (rawInvites || []).map((inv: any) => ({
        id: inv.id,
        workspace_id: inv.workspace_id,
        workspace_name: inv.workspace?.name || 'Workspace',
        email: inv.email,
        invited_by: inv.invited_by,
        invited_by_name: inv.inviter?.name || 'Trưởng nhóm',
        role: inv.role as UserRole,
        status: inv.status,
        created_at: inv.created_at,
      }));
    }

    // Fetch workspaces where user is owner or member
    const { data: memberRecords } = await supabase
      .from('sw_workspace_members')
      .select('*, workspace:sw_workspaces(*)')
      .eq('user_id', authUser.id);

    const { data: ownedWorkspaces } = await supabase
      .from('sw_workspaces')
      .select('*')
      .eq('owner_id', authUser.id);

    const wsMap = new Map<string, Workspace>();

    (ownedWorkspaces || []).forEach((w: any) => {
      wsMap.set(w.id, {
        id: w.id,
        name: w.name,
        slug: w.slug,
        owner_id: w.owner_id,
        role: 'admin',
        created_at: w.created_at,
        updated_at: w.updated_at,
      });
    });

    (memberRecords || []).forEach((m: any) => {
      if (m.workspace) {
        wsMap.set(m.workspace.id, {
          id: m.workspace.id,
          name: m.workspace.name,
          slug: m.workspace.slug,
          owner_id: m.workspace.owner_id,
          role: (m.role as UserRole) || (m.workspace.owner_id === authUser.id ? 'admin' : 'member'),
          created_at: m.workspace.created_at,
          updated_at: m.workspace.updated_at,
        });
      }
    });

    userWorkspaces = Array.from(wsMap.values());

    // If user has NO workspaces at all, auto-create their initial workspace
    if (userWorkspaces.length === 0) {
      const defaultWsName = currentProfile?.name ? `Không gian của ${currentProfile.name}` : 'Không gian làm việc';
      const defaultSlug = (currentProfile?.name || 'workspace')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

      const { data: newWs } = await supabase
        .from('sw_workspaces')
        .insert({
          name: defaultWsName,
          slug: defaultSlug,
          owner_id: authUser.id,
        })
        .select()
        .single();

      if (newWs) {
        // Add member record as admin
        await supabase.from('sw_workspace_members').insert({
          workspace_id: newWs.id,
          user_id: authUser.id,
          role: 'admin',
        });

        // Migrate any unassigned tasks/projects to this initial workspace
        await supabase.from('sw_projects').update({ workspace_id: newWs.id }).is('workspace_id', null);
        await supabase.from('sw_tasks').update({ workspace_id: newWs.id }).is('workspace_id', null);
        await supabase.from('sw_ideas').update({ workspace_id: newWs.id }).is('workspace_id', null);
        await supabase.from('sw_knowledge').update({ workspace_id: newWs.id }).is('workspace_id', null);
        await supabase.from('sw_decisions').update({ workspace_id: newWs.id }).is('workspace_id', null);
        await supabase.from('sw_activities').update({ workspace_id: newWs.id }).is('workspace_id', null);

        const initialWs: Workspace = {
          id: newWs.id,
          name: newWs.name,
          slug: newWs.slug,
          owner_id: newWs.owner_id,
          role: 'admin',
          created_at: newWs.created_at,
        };
        userWorkspaces = [initialWs];
      }
    }
  }

  // 3. Resolve active workspace
  let activeWorkspace: Workspace | null = null;
  if (userWorkspaces.length > 0) {
    if (requestedWorkspaceId) {
      activeWorkspace = userWorkspaces.find((w) => w.id === requestedWorkspaceId) || userWorkspaces[0];
    } else {
      activeWorkspace = userWorkspaces[0];
    }
  }

  // 4. Fetch Workspace Members for the active workspace
  let workspaceMembers: WorkspaceMember[] = [];
  let workspaceUsers: User[] = [];

  if (activeWorkspace) {
    const { data: rawMembers } = await supabase
      .from('sw_workspace_members')
      .select(`
        *,
        profile:sw_profiles(*)
      `)
      .eq('workspace_id', activeWorkspace.id);

    workspaceMembers = (rawMembers || []).map((m: any) => ({
      id: m.id,
      workspace_id: m.workspace_id,
      user_id: m.user_id,
      role: m.role as UserRole,
      user_name: m.profile?.name,
      user_email: m.profile?.email,
      user_avatar: m.profile?.avatar_url,
      joined_at: m.joined_at,
    }));

    workspaceUsers = (rawMembers || [])
      .filter((m: any) => m.profile)
      .map((m: any) => ({
        id: m.profile.id,
        name: m.profile.name,
        avatar: m.profile.avatar_url || '👤',
        avatar_url: m.profile.avatar_url,
        email: m.profile.email,
        role: (m.role as UserRole) || 'member',
        timezone: m.profile.timezone || 'Asia/Ho_Chi_Minh',
        location: m.profile.location || 'Vietnam',
        flag: m.profile.flag || '🇻🇳',
        color: m.profile.color || '#3b82f6',
        last_visited_at: m.profile.last_visited_at || m.profile.created_at,
      }));
  }

  // Fallback if empty
  if (workspaceUsers.length === 0 && currentProfile) {
    workspaceUsers = [
      {
        id: currentProfile.id,
        name: currentProfile.name,
        avatar: currentProfile.avatar_url || '👤',
        avatar_url: currentProfile.avatar_url,
        email: currentProfile.email,
        role: (activeWorkspace?.role as UserRole) || 'admin',
        timezone: currentProfile.timezone,
        location: currentProfile.location,
        flag: currentProfile.flag,
        color: currentProfile.color,
        last_visited_at: currentProfile.last_visited_at,
      },
    ];
  } else if (workspaceUsers.length === 0) {
    workspaceUsers = [
      {
        id: 'guest',
        name: 'Guest',
        avatar: '👤',
        email: '',
        role: 'member',
        timezone: 'Asia/Ho_Chi_Minh',
        location: 'Vietnam',
        flag: '🇻🇳',
        color: '#3b82f6',
        last_visited_at: new Date().toISOString(),
      },
    ];
  }

  const currentUser = authUser
    ? workspaceUsers.find((u) => u.id === authUser.id) || workspaceUsers[0]
    : workspaceUsers[0];

  // Set user role to active workspace role
  if (activeWorkspace?.role) {
    currentUser.role = activeWorkspace.role;
  }

  // 5. Fetch Projects (sw_projects) scoped to active workspace
  let projectQuery = supabase
    .from('sw_projects')
    .select('*, sw_tasks(id, status)')
    .order('updated_at', { ascending: false });

  if (activeWorkspace) {
    projectQuery = projectQuery.or(`workspace_id.eq.${activeWorkspace.id},workspace_id.is.null`);
  }

  const { data: rawProjects } = await projectQuery;

  const projects: Project[] = (rawProjects || []).map((p: any) => {
    const pTasks = p.sw_tasks || [];
    const total = pTasks.length;
    const done = pTasks.filter((t: any) => t.status === 'done').length;
    return {
      id: p.id,
      workspace_id: p.workspace_id,
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

  // 6. Fetch Tasks (sw_tasks) scoped to active workspace
  let taskQuery = supabase
    .from('sw_tasks')
    .select(
      `
      *,
      project:sw_projects(name, color),
      creator:sw_profiles!sw_tasks_creator_id_fkey(name),
      assignee:sw_profiles!sw_tasks_assignee_id_fkey(name),
      comments:sw_comments(id)
    `
    )
    .order('updated_at', { ascending: false });

  if (activeWorkspace) {
    taskQuery = taskQuery.or(`workspace_id.eq.${activeWorkspace.id},workspace_id.is.null`);
  }

  const { data: rawTasks } = await taskQuery;

  const tasks: Task[] = (rawTasks || []).map((t: any) => ({
    id: t.id,
    workspace_id: t.workspace_id,
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

  // 7. Fetch Ideas (sw_ideas) scoped to active workspace
  let ideaQuery = supabase
    .from('sw_ideas')
    .select('*, project:sw_projects(name), creator:sw_profiles(name)')
    .order('updated_at', { ascending: false });

  if (activeWorkspace) {
    ideaQuery = ideaQuery.or(`workspace_id.eq.${activeWorkspace.id},workspace_id.is.null`);
  }

  const { data: rawIdeas } = await ideaQuery;

  const ideas: Idea[] = (rawIdeas || []).map((i: any) => ({
    id: i.id,
    workspace_id: i.workspace_id,
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

  // 8. Fetch Knowledge (sw_knowledge) scoped to active workspace
  let knowledgeQuery = supabase
    .from('sw_knowledge')
    .select('*, project:sw_projects(name), user:sw_profiles(name)')
    .order('updated_at', { ascending: false });

  if (activeWorkspace) {
    knowledgeQuery = knowledgeQuery.or(`workspace_id.eq.${activeWorkspace.id},workspace_id.is.null`);
  }

  const { data: rawKnowledge } = await knowledgeQuery;

  const knowledge: Knowledge[] = (rawKnowledge || []).map((k: any) => ({
    id: k.id,
    workspace_id: k.workspace_id,
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

  // 9. Fetch Decisions (sw_decisions) scoped to active workspace
  let decisionQuery = supabase
    .from('sw_decisions')
    .select('*, project:sw_projects(name), author:sw_profiles(name)')
    .order('created_at', { ascending: false });

  if (activeWorkspace) {
    decisionQuery = decisionQuery.or(`workspace_id.eq.${activeWorkspace.id},workspace_id.is.null`);
  }

  const { data: rawDecisions } = await decisionQuery;

  const decisions: Decision[] = (rawDecisions || []).map((d: any) => ({
    id: d.id,
    workspace_id: d.workspace_id,
    title: d.title,
    reason: d.reason || '',
    project_id: d.project_id,
    created_by_id: d.created_by_id,
    created_at: d.created_at,
    project_name: d.project?.name,
    author_name: d.author?.name,
  }));

  // 10. Fetch Activities (sw_activities) scoped to active workspace
  let activityQuery = supabase
    .from('sw_activities')
    .select(
      `
      *,
      actor:sw_profiles!sw_activities_actor_id_fkey(name, avatar_url),
      target:sw_profiles!sw_activities_target_user_id_fkey(name),
      project:sw_projects(name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(40);

  if (activeWorkspace) {
    activityQuery = activityQuery.or(`workspace_id.eq.${activeWorkspace.id},workspace_id.is.null`);
  }

  const { data: rawActivities } = await activityQuery;

  const recentActivities: Activity[] = (rawActivities || []).map((a: any) => ({
    id: a.id,
    workspace_id: a.workspace_id,
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

  // 11. Since Last Visit
  const sinceChanges = recentActivities.filter(
    (a) => new Date(a.created_at).getTime() > new Date(currentUser.last_visited_at).getTime()
  );

  const sinceLastVisit = {
    total_changes: sinceChanges.length,
    changes: sinceChanges,
  };

  // 12. Weekly Stats
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

  // 13. Attention
  const todayStr = new Date().toISOString().split('T')[0];
  const myActionTasks = tasks.filter(
    (t) => t.assignee_id === currentUser.id && t.status !== 'done'
  );

  const actionRequired: AttentionItem[] = myActionTasks.map((task) => {
    let reason = 'Được giao cho bạn';
    let severity: 'urgent' | 'high' | 'normal' = 'normal';

    if (task.priority === 'urgent') {
      severity = 'urgent';
      reason = 'Nhiệm vụ khẩn cấp';
    } else if (task.priority === 'high') {
      severity = 'high';
      reason = 'Ưu tiên cao';
    }

    if (task.due_date) {
      if (task.due_date < todayStr) {
        severity = 'urgent';
        reason = 'Đã quá hạn';
      } else if (task.due_date === todayStr) {
        severity = 'high';
        reason = 'Đến hạn hôm nay';
      }
    }

    if (task.creator_id !== currentUser.id) {
      reason = `${task.creator_name || 'Đồng đội'} giao cho bạn`;
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
    reason: `Đang chờ ${task.assignee_name || 'Thành viên'} (${task.status.replace('_', ' ')})`,
    severity: task.priority === 'urgent' ? 'urgent' : 'normal',
  }));

  return {
    currentUser,
    users: workspaceUsers,
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
    activeWorkspace,
    workspaces: userWorkspaces,
    pendingInvitations,
    workspaceMembers,
  };
}

export async function updateProfileRole(userId: string, role: UserRole) {
  const supabase = await createClient();

  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (caller) {
    const { data: callerProfile } = await supabase
      .from('sw_profiles')
      .select('role')
      .eq('id', caller.id)
      .maybeSingle();

    if (callerProfile?.role !== 'admin') {
      throw new Error('Chỉ Trưởng nhóm (Lead) mới có quyền thay đổi vai trò của thành viên.');
    }
  }

  const { data, error } = await supabase
    .from('sw_profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLastVisitedSupabase(userId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  await supabase
    .from('sw_profiles')
    .update({ last_visited_at: now })
    .eq('id', userId);
  return true;
}

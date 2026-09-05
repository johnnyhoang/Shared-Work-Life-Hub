'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  HubState,
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
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
} from '@/types';

type NavigationTab = 'home' | 'work' | 'projects' | 'feed' | 'more';
type QuickActionType = 'task' | 'idea' | 'decision' | 'knowledge';

interface HubContextType {
  hubState: HubState | null;
  isLoading: boolean;
  refreshHub: (explicitWorkspaceId?: string) => Promise<void>;
  markVisited: () => Promise<void>;

  // Workspace Actions & State
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  pendingInvitations: WorkspaceInvitation[];
  workspaceMembers: WorkspaceMember[];
  isWorkspaceAdmin: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  /** `error` is an ApiErrorCode; render it via errorText(t.errors, error). */
  createWorkspace: (name: string, description?: string) => Promise<{ success: boolean; workspace?: Workspace; error?: string }>;
  inviteMember: (email: string, role?: 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
  respondInvitation: (invitationId: string, action: 'accept' | 'decline') => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: 'admin' | 'member') => Promise<boolean>;

  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Modals & Drawers
  isQuickActionOpen: boolean;
  quickActionInitialType: QuickActionType;
  openQuickAction: (type?: QuickActionType) => void;
  closeQuickAction: () => void;

  isCreateWorkspaceOpen: boolean;
  openCreateWorkspace: () => void;
  closeCreateWorkspace: () => void;

  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;

  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;

  // Task Actions
  createTask: (params: {
    title: string;
    description?: string;
    project_id?: string | null;
    assignee_id: string;
    priority?: TaskPriority;
    due_date?: string | null;
    status?: TaskStatus;
  }) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTaskStatus: (task: Task) => Promise<Task | null>;

  // Project Actions
  createProject: (params: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    status?: ProjectStatus;
  }) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;

  // Idea Actions
  createIdea: (params: {
    title: string;
    description?: string;
    project_id?: string | null;
    status?: IdeaStatus;
  }) => Promise<Idea | null>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<Idea | null>;
  convertIdea: (id: string, assignee_id: string) => Promise<Task | null>;

  // Knowledge Actions
  createKnowledge: (params: {
    topic: string;
    notes?: string;
    status?: KnowledgeStatus;
    project_id?: string | null;
  }) => Promise<Knowledge | null>;
  updateKnowledge: (id: string, updates: Partial<Knowledge>) => Promise<Knowledge | null>;

  // Decision Actions
  createDecision: (params: {
    title: string;
    reason: string;
    project_id?: string | null;
  }) => Promise<Decision | null>;

  // Comments
  fetchComments: (entityType: EntityType, entityId: string) => Promise<Comment[]>;
  addComment: (entityType: EntityType, entityId: string, content: string) => Promise<Comment | null>;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export function HubProvider({ children }: { children: React.ReactNode }) {
  const [hubState, setHubState] = useState<HubState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Modal states
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  const [quickActionInitialType, setQuickActionInitialType] = useState<QuickActionType>('task');
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const openCreateWorkspace = () => setIsCreateWorkspaceOpen(true);
  const closeCreateWorkspace = () => setIsCreateWorkspaceOpen(false);

  const refreshHub = useCallback(async (explicitWorkspaceId?: string) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      setIsLoading(false);
      return;
    }
    try {
      let targetWorkspaceId = explicitWorkspaceId;
      if (!targetWorkspaceId && typeof window !== 'undefined') {
        targetWorkspaceId = localStorage.getItem('sw_active_workspace_id') || undefined;
      }

      const query = targetWorkspaceId ? `?workspaceId=${encodeURIComponent(targetWorkspaceId)}` : '';
      const res = await fetch(`/api/hub${query}`);
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data: HubState = await res.json();
          setHubState(data);
          if (data.activeWorkspace?.id && typeof window !== 'undefined') {
            localStorage.setItem('sw_active_workspace_id', data.activeWorkspace.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to refresh hub state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHub();
  }, [refreshHub]);

  const currentUserId = hubState?.currentUser?.id || '';
  const activeWorkspace = hubState?.activeWorkspace || null;
  const workspaces = hubState?.workspaces || [];
  const pendingInvitations = hubState?.pendingInvitations || [];
  const workspaceMembers = hubState?.workspaceMembers || [];

  // Determine if the current user is an admin of the active workspace
  const currentMember = workspaceMembers.find(m => m.user_id === currentUserId);
  const isWorkspaceAdmin = 
    activeWorkspace?.owner_id === currentUserId || 
    currentMember?.role === 'admin' || 
    hubState?.currentUser?.role === 'admin';

  const switchWorkspace = async (workspaceId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sw_active_workspace_id', workspaceId);
    }
    setIsLoading(true);
    await refreshHub(workspaceId);
  };

  const createWorkspace = async (
    name: string,
    description?: string
  ): Promise<{ success: boolean; workspace?: Workspace; error?: string }> => {
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'workspace_create_failed' };
      }
      const created: Workspace = data;
      await switchWorkspace(created.id);
      return { success: true, workspace: created };
    } catch (err: any) {
      console.error('Failed to create workspace:', err);
      return { success: false, error: 'network' };
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'member' = 'member'): Promise<{ success: boolean; error?: string }> => {
    if (!activeWorkspace) return { success: false, error: 'not_found' };
    try {
      const res = await fetch('/api/workspaces/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: activeWorkspace.id,
          email,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'invite_failed' };
      }
      await refreshHub();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to invite member:', err);
      return { success: false, error: 'network' };
    }
  };

  const respondInvitation = async (invitationId: string, action: 'accept' | 'decline'): Promise<boolean> => {
    try {
      const res = await fetch(`/api/workspaces/invitations/${invitationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (action === 'accept' && data.invitation?.workspace_id) {
        await switchWorkspace(data.invitation.workspace_id);
      } else {
        await refreshHub();
      }
      return true;
    } catch (err) {
      console.error('Failed to respond to invitation:', err);
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    if (!activeWorkspace) return false;
    try {
      const res = await fetch('/api/workspaces/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: activeWorkspace.id,
          member_id: memberId,
        }),
      });
      if (res.ok) {
        await refreshHub();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to remove member:', err);
      return false;
    }
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member'): Promise<boolean> => {
    if (!activeWorkspace) return false;
    try {
      const res = await fetch('/api/workspaces/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: activeWorkspace.id,
          member_id: memberId,
          role,
        }),
      });
      if (res.ok) {
        await refreshHub();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update member role:', err);
      return false;
    }
  };

  const markVisited = async () => {
    if (!currentUserId) return;
    try {
      await fetch('/api/users/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      await refreshHub();
    } catch (err) {
      console.error('Failed to mark visited:', err);
    }
  };

  const openQuickAction = (type: QuickActionType = 'task') => {
    setQuickActionInitialType(type);
    setIsQuickActionOpen(true);
  };

  const closeQuickAction = () => {
    setIsQuickActionOpen(false);
  };

  // Task methods
  const createTask = async (params: {
    title: string;
    description?: string;
    project_id?: string | null;
    assignee_id: string;
    priority?: TaskPriority;
    due_date?: string | null;
    status?: TaskStatus;
  }): Promise<Task | null> => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          creator_id: currentUserId,
          workspace_id: activeWorkspace?.id || null,
        }),
      });
      if (!res.ok) return null;
      const created = await res.json();
      await refreshHub();
      return created;
    } catch (err) {
      console.error('Failed to create task:', err);
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          actor_id: currentUserId,
        }),
      });
      if (!res.ok) return null;
      const updated = await res.json();
      if (selectedTask?.id === id) {
        setSelectedTask(updated);
      }
      await refreshHub();
      return updated;
    } catch (err) {
      console.error('Failed to update task:', err);
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tasks/${id}?actor_id=${currentUserId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (selectedTask?.id === id) {
          setSelectedTask(null);
        }
        await refreshHub();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete task:', err);
      return false;
    }
  };

  const toggleTaskStatus = async (task: Task): Promise<Task | null> => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'in_progress' : 'done';
    return updateTask(task.id, { status: nextStatus });
  };

  // Project methods
  const createProject = async (params: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    status?: ProjectStatus;
  }): Promise<Project | null> => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          actor_id: currentUserId,
          workspace_id: activeWorkspace?.id || null,
        }),
      });
      if (!res.ok) return null;
      const created = await res.json();
      await refreshHub();
      return created;
    } catch (err) {
      console.error('Failed to create project:', err);
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          actor_id: currentUserId,
        }),
      });
      if (!res.ok) return null;
      const updated = await res.json();
      if (selectedProject?.id === id) {
        setSelectedProject(updated);
      }
      await refreshHub();
      return updated;
    } catch (err) {
      console.error('Failed to update project:', err);
      return null;
    }
  };

  // Idea methods
  const createIdea = async (params: {
    title: string;
    description?: string;
    project_id?: string | null;
    status?: IdeaStatus;
  }): Promise<Idea | null> => {
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          creator_id: currentUserId,
          workspace_id: activeWorkspace?.id || null,
        }),
      });
      if (!res.ok) return null;
      const created = await res.json();
      await refreshHub();
      return created;
    } catch (err) {
      console.error('Failed to create idea:', err);
      return null;
    }
  };

  const updateIdea = async (id: string, updates: Partial<Idea>): Promise<Idea | null> => {
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          actor_id: currentUserId,
        }),
      });
      if (!res.ok) return null;
      const updated = await res.json();
      await refreshHub();
      return updated;
    } catch (err) {
      console.error('Failed to update idea:', err);
      return null;
    }
  };

  const convertIdea = async (id: string, assignee_id: string): Promise<Task | null> => {
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'convert',
          assignee_id,
          actor_id: currentUserId,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      await refreshHub();
      return data.task;
    } catch (err) {
      console.error('Failed to convert idea:', err);
      return null;
    }
  };

  // Knowledge methods
  const createKnowledge = async (params: {
    topic: string;
    notes?: string;
    status?: KnowledgeStatus;
    project_id?: string | null;
  }): Promise<Knowledge | null> => {
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          user_id: currentUserId,
          workspace_id: activeWorkspace?.id || null,
        }),
      });
      if (!res.ok) return null;
      const created = await res.json();
      await refreshHub();
      return created;
    } catch (err) {
      console.error('Failed to create knowledge:', err);
      return null;
    }
  };

  const updateKnowledge = async (id: string, updates: Partial<Knowledge>): Promise<Knowledge | null> => {
    try {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) return null;
      const updated = await res.json();
      await refreshHub();
      return updated;
    } catch (err) {
      console.error('Failed to update knowledge:', err);
      return null;
    }
  };

  // Decision methods
  const createDecision = async (params: {
    title: string;
    reason: string;
    project_id?: string | null;
  }): Promise<Decision | null> => {
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          created_by_id: currentUserId,
          workspace_id: activeWorkspace?.id || null,
        }),
      });
      if (!res.ok) return null;
      const created = await res.json();
      await refreshHub();
      return created;
    } catch (err) {
      console.error('Failed to create decision:', err);
      return null;
    }
  };

  // Comments
  const fetchComments = async (entityType: EntityType, entityId: string): Promise<Comment[]> => {
    try {
      const res = await fetch(`/api/comments?entity_type=${entityType}&entity_id=${entityId}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      return [];
    }
  };

  const addComment = async (
    entityType: EntityType,
    entityId: string,
    content: string
  ): Promise<Comment | null> => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          user_id: currentUserId,
          content,
        }),
      });
      if (res.ok) {
        const comment = await res.json();
        await refreshHub();
        return comment;
      }
      return null;
    } catch (err) {
      console.error('Failed to add comment:', err);
      return null;
    }
  };

  return (
    <HubContext.Provider
      value={{
        hubState,
        isLoading,
        refreshHub,
        markVisited,
        activeWorkspace,
        workspaces,
        pendingInvitations,
        workspaceMembers,
        isWorkspaceAdmin,
        switchWorkspace,
        createWorkspace,
        inviteMember,
        respondInvitation,
        removeMember,
        updateMemberRole,
        activeTab,
        setActiveTab,
        isQuickActionOpen,
        quickActionInitialType,
        openQuickAction,
        closeQuickAction,
        isCreateWorkspaceOpen,
        openCreateWorkspace,
        closeCreateWorkspace,
        selectedTask,
        setSelectedTask,
        selectedProject,
        setSelectedProject,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        createProject,
        updateProject,
        createIdea,
        updateIdea,
        convertIdea,
        createKnowledge,
        updateKnowledge,
        createDecision,
        fetchComments,
        addComment,
      }}
    >
      {children}
    </HubContext.Provider>
  );
}

export function useHub() {
  const context = useContext(HubContext);
  if (!context) {
    throw new Error('useHub must be used within a HubProvider');
  }
  return context;
}


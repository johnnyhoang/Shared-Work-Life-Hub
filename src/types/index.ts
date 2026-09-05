export type UserId = string;
export type UserRole = 'admin' | 'member';

export interface User {
  id: UserId;
  name: string;
  avatar: string;
  avatar_url?: string;
  email: string;
  role: UserRole;
  timezone: string;
  location: string;
  flag: string;
  color: string;
  last_visited_at: string; // ISO 8601 UTC
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: UserId;
  role?: UserRole; // current user's role in this workspace
  member_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: UserId;
  role: UserRole;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  joined_at: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'canceled';

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  workspace_name?: string;
  workspace?: { name: string };
  email: string;
  invited_by: UserId;
  invited_by_name?: string;
  inviter?: { name: string };
  role: UserRole;
  status: InvitationStatus;
  created_at: string;
}

export type AttachmentEntityType = 'task' | 'idea' | 'project';

export interface Attachment {
  id: string;
  workspace_id?: string | null;
  entity_type: AttachmentEntityType;
  entity_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  storage_path: string;
  uploaded_by: UserId;
  uploader_name?: string;
  uploader_avatar?: string;
  created_at: string;
}

export type TaskStatus = 'inbox' | 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  workspace_id?: string | null;
  title: string;
  description: string;
  project_id: string | null;
  creator_id: UserId;
  assignee_id: UserId;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null; // ISO 8601 UTC or YYYY-MM-DD
  created_at: string; // ISO 8601 UTC
  updated_at: string; // ISO 8601 UTC
  project_name?: string;
  project_color?: string;
  creator_name?: string;
  assignee_name?: string;
  comment_count?: number;
  attachment_count?: number;
  attachments?: Attachment[];
}

export type ProjectStatus = 'active' | 'paused' | 'archived';

export interface Project {
  id: string;
  workspace_id?: string | null;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  total_tasks?: number;
  completed_tasks?: number;
  active_tasks?: number;
  attachment_count?: number;
  attachments?: Attachment[];
}

export type IdeaStatus = 'idea' | 'maybe' | 'planned' | 'converted';

export interface Idea {
  id: string;
  workspace_id?: string | null;
  title: string;
  description: string;
  status: IdeaStatus;
  project_id: string | null;
  creator_id: UserId;
  created_at: string;
  updated_at: string;
  project_name?: string;
  creator_name?: string;
  attachment_count?: number;
  attachments?: Attachment[];
}

export type KnowledgeStatus = 'to_learn' | 'learning' | 'mastered';

export interface Knowledge {
  id: string;
  workspace_id?: string | null;
  topic: string;
  notes: string;
  status: KnowledgeStatus;
  project_id: string | null;
  user_id: UserId;
  created_at: string;
  updated_at: string;
  project_name?: string;
  user_name?: string;
}

export interface Decision {
  id: string;
  workspace_id?: string | null;
  title: string;
  reason: string;
  project_id: string | null;
  created_by_id: UserId;
  created_at: string;
  project_name?: string;
  author_name?: string;
}

export type EntityType = 'task' | 'project' | 'idea' | 'knowledge' | 'decision' | 'comment';

export interface Comment {
  id: string;
  workspace_id?: string | null;
  entity_type: EntityType;
  entity_id: string;
  user_id: UserId;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export type ActionType =
  | 'created'
  | 'assigned'
  | 'status_changed'
  | 'completed'
  | 'updated'
  | 'commented'
  | 'decided'
  | 'converted';

export interface Activity {
  id: string;
  workspace_id?: string | null;
  actor_id: UserId;
  target_user_id: UserId | null;
  entity_type: EntityType;
  entity_id: string;
  action_type: ActionType;
  summary: string;
  details: string;
  project_id: string | null;
  created_at: string; // ISO 8601 UTC
  actor_name?: string;
  actor_avatar?: string;
  target_user_name?: string;
  project_name?: string;
}

export interface SinceLastVisitSummary {
  total_changes: number;
  changes: Activity[];
}

export interface WeeklyStats {
  tasks_completed: number;
  tasks_created: number;
  ideas_added: number;
  project_updates: number;
  decisions_made: number;
}

export interface AttentionItem {
  type: 'action_required' | 'waiting' | 'overdue' | 'due_today';
  task: Task;
  reason: string;
  severity: 'urgent' | 'high' | 'normal';
}

export interface HubState {
  currentUser: User;
  users: User[];
  projects: Project[];
  tasks: Task[];
  ideas: Idea[];
  knowledge: Knowledge[];
  decisions: Decision[];
  recentActivities: Activity[];
  sinceLastVisit: SinceLastVisitSummary;
  weeklyStats: WeeklyStats;
  attention: {
    actionRequired: AttentionItem[];
    waiting: AttentionItem[];
  };
  // Multi-Workspace Fields
  activeWorkspace?: Workspace | null;
  workspaces: Workspace[];
  pendingInvitations: WorkspaceInvitation[];
  workspaceMembers?: WorkspaceMember[];
}

export type NotificationChannel = 'zalo' | 'slack' | 'discord' | 'telegram' | 'messenger' | 'email';

export interface NotificationSettings {
  user_id: string;
  morning_digest_enabled: boolean;
  digest_time: string; // e.g. "08:00"
  notify_on_new_task: boolean;
  notify_on_due_today: boolean;
  notify_on_overdue: boolean;
  // Zalo
  zalo_enabled: boolean;
  zalo_user_id: string;
  zalo_webhook_url: string;
  // Slack
  slack_enabled: boolean;
  slack_webhook_url: string;
  // Discord
  discord_enabled: boolean;
  discord_webhook_url: string;
  // Telegram
  telegram_enabled: boolean;
  telegram_bot_token: string;
  telegram_chat_id: string;
  // Messenger
  messenger_enabled: boolean;
  messenger_psid: string;
  messenger_webhook_url: string;
  // Email
  email_enabled: boolean;
  email_address: string;
  updated_at?: string;
}

export interface DigestPayload {
  userName: string;
  overdueTasks: Task[];
  dueTodayTasks: Task[];
  newTasks: Task[];
  appUrl?: string;
}

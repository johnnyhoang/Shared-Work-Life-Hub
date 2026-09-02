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

export type TaskStatus = 'inbox' | 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
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
}

export type ProjectStatus = 'active' | 'paused' | 'archived';

export interface Project {
  id: string;
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
}

export type IdeaStatus = 'idea' | 'maybe' | 'planned' | 'converted';

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  project_id: string | null;
  creator_id: UserId;
  created_at: string;
  updated_at: string;
  project_name?: string;
  creator_name?: string;
}

export type KnowledgeStatus = 'to_learn' | 'learning' | 'mastered';

export interface Knowledge {
  id: string;
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
  partnerUser: User;
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
}

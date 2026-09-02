import { db } from '../db';
import { seedDatabase } from '../seed';
import {
  AttentionItem,
  HubState,
  User,
  WeeklyStats,
} from '@/types';
import { getProjects } from './projectService';
import { getTasks } from './taskService';
import { getIdeas } from './ideaService';
import { getKnowledgeList } from './knowledgeService';
import { getDecisions } from './decisionService';
import { getActivities } from './activityService';

export function getHubState(activeUserId?: string): HubState {
  // Ensure database is initialized & seeded
  seedDatabase();

  const users = db.prepare('SELECT * FROM users ORDER BY name ASC').all() as User[];
  if (users.length === 0) {
    throw new Error('No users found after seed');
  }

  const currentUser = users.find((u) => u.id === activeUserId) || users[0];
  const partnerUser = users.find((u) => u.id !== currentUser.id) || users[1] || users[0];

  const projects = getProjects();
  const tasks = getTasks();
  const ideas = getIdeas();
  const knowledge = getKnowledgeList();
  const decisions = getDecisions();
  const recentActivities = getActivities({ limit: 30 });

  // 1. Calculate Since Last Visit (Activities since currentUser.last_visited_at)
  const sinceChanges = getActivities({
    since: currentUser.last_visited_at,
    limit: 50,
  });

  const sinceLastVisit = {
    total_changes: sinceChanges.length,
    changes: sinceChanges,
  };

  // 2. Calculate Weekly Stats (last 7 days)
  const oneWeekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const tasksCompleted = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM activities 
         WHERE action_type = 'completed' AND entity_type = 'task' AND created_at >= ?`
      )
      .get(oneWeekAgoIso) as { count: number }
  ).count;

  const tasksCreated = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM tasks WHERE created_at >= ?`
      )
      .get(oneWeekAgoIso) as { count: number }
  ).count;

  const ideasAdded = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM ideas WHERE created_at >= ?`
      )
      .get(oneWeekAgoIso) as { count: number }
  ).count;

  const projectUpdates = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM activities 
         WHERE entity_type = 'project' AND created_at >= ?`
      )
      .get(oneWeekAgoIso) as { count: number }
  ).count;

  const decisionsMade = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM decisions WHERE created_at >= ?`
      )
      .get(oneWeekAgoIso) as { count: number }
  ).count;

  const weeklyStats: WeeklyStats = {
    tasks_completed: tasksCompleted,
    tasks_created: tasksCreated,
    ideas_added: ideasAdded,
    project_updates: projectUpdates,
    decisions_made: decisionsMade,
  };

  // 3. Attention List (Action Required vs Waiting)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Action Required: Assigned to Me & Not Done
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
      reason = 'High priority task';
    }

    if (task.due_date) {
      const dueDateOnly = task.due_date.split('T')[0];
      if (dueDateOnly < todayStr) {
        severity = 'urgent';
        reason = 'Overdue task';
      } else if (dueDateOnly === todayStr) {
        severity = 'high';
        reason = 'Due today';
      }
    }

    if (task.creator_id !== currentUser.id) {
      reason = `${task.creator_name || 'Partner'} assigned to you`;
    }

    return {
      type: 'action_required',
      task,
      reason,
      severity,
    };
  });

  // Sort actionRequired by severity (urgent > high > normal)
  actionRequired.sort((a, b) => {
    const sevRank = { urgent: 1, high: 2, normal: 3 };
    return sevRank[a.severity] - sevRank[b.severity];
  });

  // Waiting: Created by Me, Assigned to Partner, Not Done
  const waitingTasks = tasks.filter(
    (t) => t.creator_id === currentUser.id && t.assignee_id !== currentUser.id && t.status !== 'done'
  );

  const waiting: AttentionItem[] = waitingTasks.map((task) => ({
    type: 'waiting',
    task,
    reason: `Waiting for ${partnerUser.name} (${task.status.replace('_', ' ')})`,
    severity: task.priority === 'urgent' ? 'urgent' : task.priority === 'high' ? 'high' : 'normal',
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

export function updateLastVisited(userId: string): void {
  const now = new Date().toISOString();
  db.prepare('UPDATE users SET last_visited_at = ? WHERE id = ?').run(now, userId);
}

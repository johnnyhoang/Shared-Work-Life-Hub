'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { formatDueDate } from '@/lib/dateUtils';
import {
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export function TaskCard({ task }: { task: Task }) {
  const { hubState, setSelectedTask, toggleTaskStatus, updateTask } = useHub();

  if (!hubState) return null;

  const currentUserId = hubState.currentUser.id;
  const isAssignedToMe = task.assignee_id === currentUserId;
  const isCreatedByMe = task.creator_id === currentUserId;
  const isCompleted = task.status === 'done';

  const dueInfo = formatDueDate(task.due_date);

  const priorityStyles: Record<TaskPriority, { bg: string; text: string; label: string }> = {
    urgent: { bg: 'bg-rose-500 text-white', text: 'text-rose-600', label: 'Urgent' },
    high: { bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400', text: 'text-amber-600', label: 'High' },
    medium: { bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400', text: 'text-blue-600', label: 'Med' },
    low: { bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400', text: 'text-zinc-500', label: 'Low' },
  };

  // Assignee direction label
  let assignmentLabel = '';
  if (isAssignedToMe && !isCreatedByMe) {
    assignmentLabel = `${task.creator_name || 'Partner'} → You`;
  } else if (!isAssignedToMe && isCreatedByMe) {
    assignmentLabel = `You → ${task.assignee_name || 'Partner'}`;
  } else if (isAssignedToMe && isCreatedByMe) {
    assignmentLabel = 'For You';
  } else {
    assignmentLabel = `${task.creator_name || 'User'} → ${task.assignee_name || 'Partner'}`;
  }

  return (
    <div
      onClick={() => setSelectedTask(task)}
      className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        isCompleted
          ? 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 opacity-70'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* 1-tap Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleTaskStatus(task);
        }}
        className={`mt-0.5 transition ${
          isCompleted
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-zinc-400 hover:text-emerald-500 dark:text-zinc-600 dark:hover:text-emerald-400'
        }`}
        title={isCompleted ? 'Mark as incomplete' : 'Mark as done'}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950/40" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-xs font-semibold leading-snug break-words ${
              isCompleted
                ? 'line-through text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {task.title}
          </h4>

          {/* Priority Pill */}
          {task.priority !== 'low' && !isCompleted && (
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold shrink-0 ${
                priorityStyles[task.priority].bg
              }`}
            >
              {priorityStyles[task.priority].label}
            </span>
          )}
        </div>

        {task.description && !isCompleted && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
            {task.description}
          </p>
        )}

        {/* Metadata Footer */}
        <div className="flex items-center gap-2 flex-wrap mt-2 text-[11px]">
          {/* Project Tag */}
          {task.project_name && (
            <span
              className="px-1.5 py-0.5 rounded-md font-medium text-[10px]"
              style={{
                backgroundColor: `${task.project_color || '#3b82f6'}18`,
                color: task.project_color || '#3b82f6',
              }}
            >
              {task.project_name}
            </span>
          )}

          {/* Directionality Tag */}
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${
              isAssignedToMe && !isCreatedByMe
                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold'
                : !isAssignedToMe && isCreatedByMe
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>{assignmentLabel}</span>
          </span>

          {/* Due Date */}
          {task.due_date && (
            <span
              className={`flex items-center gap-1 font-medium ${
                isCompleted
                  ? 'text-zinc-400'
                  : dueInfo.isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : dueInfo.isToday
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{dueInfo.text}</span>
            </span>
          )}

          {/* Comments count */}
          {task.comment_count !== undefined && task.comment_count > 0 && (
            <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 text-[10px]">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comment_count}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

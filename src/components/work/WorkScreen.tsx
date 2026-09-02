'use client';

import React, { useState, useMemo } from 'react';
import { useHub } from '@/context/HubContext';
import { TaskCard } from './TaskCard';
import { TaskStatus, TaskPriority } from '@/types';
import {
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Inbox,
  ListTodo,
  PlayCircle,
  Clock,
  ArrowRightLeft,
  UserCheck,
} from 'lucide-react';

type WorkViewTab = 'my_work' | 'assigned_by_me' | 'waiting' | 'all';

export function WorkScreen() {
  const { hubState, openQuickAction } = useHub();
  const [viewTab, setViewTab] = useState<WorkViewTab>('my_work');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!hubState) return null;

  const currentUserId = hubState.currentUser.id;
  const partnerName = hubState.partnerUser.name;

  // Filter tasks based on view tab & filters
  const filteredTasks = hubState.tasks.filter((task) => {
    // 1. Tab View Filter
    if (viewTab === 'my_work') {
      if (task.assignee_id !== currentUserId) return false;
    } else if (viewTab === 'assigned_by_me') {
      if (task.creator_id !== currentUserId || task.assignee_id === currentUserId) return false;
    } else if (viewTab === 'waiting') {
      if (task.creator_id !== currentUserId || task.assignee_id === currentUserId || task.status === 'done') return false;
    }

    // 2. Project Filter
    if (selectedProjectId !== 'all' && task.project_id !== selectedProjectId) {
      return false;
    }

    // 3. Priority Filter
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }

    // 4. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchProject = task.project_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchProject) return false;
    }

    return true;
  });

  const taskGroups: { status: TaskStatus; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { status: 'in_progress', label: 'In Progress', icon: PlayCircle, color: 'text-amber-500' },
    { status: 'todo', label: 'Todo', icon: ListTodo, color: 'text-blue-500' },
    { status: 'inbox', label: 'Inbox', icon: Inbox, color: 'text-zinc-500' },
    { status: 'done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header & New Task button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Work & Tasks
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Action items and deliverables
          </p>
        </div>

        <button
          onClick={() => openQuickAction('task')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Segmented Tab Bar */}
      <div className="grid grid-cols-4 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 text-xs font-medium">
        <button
          onClick={() => setViewTab('my_work')}
          className={`py-1.5 px-2 rounded-lg transition text-center truncate ${
            viewTab === 'my_work'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          📌 My Work
        </button>
        <button
          onClick={() => setViewTab('assigned_by_me')}
          className={`py-1.5 px-2 rounded-lg transition text-center truncate ${
            viewTab === 'assigned_by_me'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          📤 Assigned
        </button>
        <button
          onClick={() => setViewTab('waiting')}
          className={`py-1.5 px-2 rounded-lg transition text-center truncate ${
            viewTab === 'waiting'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          ⏳ Waiting
        </button>
        <button
          onClick={() => setViewTab('all')}
          className={`py-1.5 px-2 rounded-lg transition text-center truncate ${
            viewTab === 'all'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          📑 All
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[140px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Project Selector */}
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Projects</option>
          {hubState.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Priority Selector */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">🔴 Urgent</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">⚪ Low</option>
        </select>
      </div>

      {/* Tasks grouped by Status */}
      <div className="space-y-4">
        {taskGroups.map((group) => {
          const groupTasks = filteredTasks.filter((t) => t.status === group.status);
          const Icon = group.icon;

          if (groupTasks.length === 0 && (viewTab === 'waiting' || searchQuery)) {
            return null; // Skip empty groups during searches
          }

          return (
            <div key={group.status} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${group.color}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    {group.label}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">
                    {groupTasks.length}
                  </span>
                </div>
              </div>

              {groupTasks.length === 0 ? (
                <div className="py-3 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
                  No tasks in {group.label.toLowerCase()}
                </div>
              ) : (
                <div className="space-y-2">
                  {groupTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

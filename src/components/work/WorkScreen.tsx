'use client';

import React, { useState, useRef } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { formatDueDate } from '@/lib/dateUtils';
import { TaskPriority } from '@/types';
import { useMention, MentionDropdown } from '../common/MentionAutocomplete';
import {
  CheckCircle2,
  Circle,
  Search,
  Clock,
  UserCheck,
  Plus,
  Folder,
  Calendar,
  Flag,
  User,
} from 'lucide-react';

export function WorkScreen() {
  const {
    hubState,
    createTask,
    setSelectedTask,
    toggleTaskStatus,
    openQuickAction,
  } = useHub();
  const { t } = useI18n();

  const [filterTab, setFilterTab] = useState<'my' | 'team' | 'done'>('my');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAssigneeId, setQuickAssigneeId] = useState<string | null>(null);
  const [quickProjectId, setQuickProjectId] = useState<string>('');
  const [quickDueDate, setQuickDueDate] = useState<string>('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickInputRef = useRef<HTMLInputElement>(null);

  const mention = useMention({
    users: hubState?.users || [],
    onSelectUser: (user) => {
      setQuickAssigneeId(user.id);
    },
  });

  if (!hubState) return null;

  const currentUserId = hubState.currentUser.id;

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await createTask({
      title: quickTitle.trim(),
      assignee_id: quickAssigneeId || currentUserId,
      project_id: quickProjectId || null,
      due_date: quickDueDate || null,
      priority: quickPriority,
      status: 'todo',
    });
    setQuickTitle('');
    setQuickAssigneeId(null);
    setQuickProjectId('');
    setQuickDueDate('');
    setQuickPriority('medium');
    setIsExpanded(false);
    setIsSubmitting(false);
  };

  const filteredTasks = hubState.tasks.filter((task) => {
    // 1. Tab filter
    if (filterTab === 'done') {
      if (task.status !== 'done') return false;
    } else {
      if (task.status === 'done') return false;

      if (filterTab === 'my') {
        if (task.assignee_id !== currentUserId) return false;
      } else if (filterTab === 'team') {
        if (task.assignee_id === currentUserId) return false;
      }
    }

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchProject = task.project_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchProject) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-2xl mx-auto">
      {/* Header & Title */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.work.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t.work.manageSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => openQuickAction('task')}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.work.newTask}</span>
        </button>
      </div>

      {/* Quick Task Add Card with Project & Detail Pickers */}
      <form
        onSubmit={handleQuickSubmit}
        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500"
      >
        <div className="relative">
          <input
            ref={quickInputRef}
            type="text"
            value={quickTitle}
            onFocus={() => setIsExpanded(true)}
            onChange={(e) => {
              setQuickTitle(e.target.value);
              mention.checkMention(e.target.value, e.target.selectionStart || 0);
            }}
            onKeyDown={(e) => {
              const handled = mention.handleKeyDown(
                e,
                quickTitle,
                quickInputRef.current?.selectionStart || 0,
                setQuickTitle,
                quickInputRef
              );
              if (handled) e.stopPropagation();
            }}
            placeholder={
              t.work.quickAddPlaceholder
            }
            className="w-full pl-4 pr-24 py-3.5 text-sm sm:text-base font-medium bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />

          {quickTitle.trim() && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-xl active:scale-95 shadow-xs transition"
            >
              {isSubmitting ? '...' : t.common.save}
            </button>
          )}

          {mention.isOpen && (
            <MentionDropdown
              users={mention.filteredUsers}
              selectedIndex={mention.selectedIndex}
              onSelect={(user) => {
                mention.applyMention(
                  user,
                  quickTitle,
                  quickInputRef.current?.selectionStart || quickTitle.length,
                  setQuickTitle,
                  quickInputRef
                );
              }}
            />
          )}
        </div>

        {/* Quick Options Bar (Project, Due Date, Priority) */}
        {(isExpanded || quickTitle.trim()) && (
          <div className="flex items-center gap-2 px-3 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-800/30 overflow-x-auto text-xs animate-in fade-in duration-150">
            {/* Project Picker */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1">
              <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <select
                value={quickProjectId}
                onChange={(e) => setQuickProjectId(e.target.value)}
                className="bg-transparent text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none text-xs"
              >
                <option value="">{t.work.noProjectOption}</option>
                {hubState.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Picker */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <input
                type="date"
                value={quickDueDate}
                onChange={(e) => setQuickDueDate(e.target.value)}
                className="bg-transparent text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none text-xs"
              />
            </div>

            {/* Priority Picker */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1">
              <Flag className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
                className="bg-transparent text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none text-xs"
              >
                <option value="urgent">{t.statusLabels.urgent}</option>
                <option value="high">{t.statusLabels.high}</option>
                <option value="medium">{t.statusLabels.medium}</option>
                <option value="low">{t.statusLabels.low}</option>
              </select>
            </div>
          </div>
        )}
      </form>

      {/* Simple 3-Tab Filter Bar with Count Badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setFilterTab('my')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'my'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <span>{t.work.tabMy}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                filterTab === 'my'
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {hubState.tasks.filter((t) => t.status !== 'done' && t.assignee_id === currentUserId).length}
            </span>
          </button>
          <button
            onClick={() => setFilterTab('team')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'team'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <span>{t.work.tabTeam}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                filterTab === 'team'
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {hubState.tasks.filter((t) => t.status !== 'done' && t.assignee_id !== currentUserId).length}
            </span>
          </button>
          <button
            onClick={() => setFilterTab('done')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'done'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <span>{t.work.tabDone}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                filterTab === 'done'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {hubState.tasks.filter((t) => t.status === 'done').length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[150px] max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.common.search}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-14 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-2">
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
              {filterTab === 'done'
                ? t.work.emptyDone
                : t.work.emptyTodo}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'done';
            const isAssignedToMe = task.assignee_id === currentUserId;
            const dueInfo = formatDueDate(task.due_date);

            // Clear Team collaboration assignment context
            let assignmentContext = '';
            if (isAssignedToMe && task.creator_id !== currentUserId) {
              assignmentContext = `${task.creator_name || 'Team'} → ${task.assignee_name || 'Bạn'}`;
            } else if (!isAssignedToMe) {
              assignmentContext = `${task.creator_name || 'Bạn'} → ${task.assignee_name || 'Team'}`;
            }

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition cursor-pointer ${
                  isCompleted
                    ? 'bg-zinc-50/60 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 opacity-70'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
                }`}
              >
                {/* 1-Tap Toggle Done */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskStatus(task);
                  }}
                  className={`mt-0.5 transition ${
                    isCompleted
                      ? 'text-emerald-500'
                      : 'text-zinc-400 hover:text-emerald-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950/40" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-sm sm:text-base font-bold leading-snug break-words ${
                        isCompleted
                          ? 'line-through text-zinc-400'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {task.title}
                    </span>

                    {task.priority === 'urgent' && !isCompleted && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shrink-0">
                        {t.statusLabels.urgent}
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2.5 flex-wrap mt-1.5 text-xs text-zinc-400">
                    {task.project_name && (
                      <span
                        className="px-2 py-0.5 rounded-full font-bold text-xs"
                        style={{
                          backgroundColor: `${task.project_color || '#3b82f6'}18`,
                          color: task.project_color || '#3b82f6',
                        }}
                      >
                        {task.project_name}
                      </span>
                    )}

                    {assignmentContext && (
                      <span className="flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{assignmentContext}</span>
                      </span>
                    )}

                    {task.due_date && (
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          dueInfo.isOverdue ? 'text-rose-600 font-bold' : ''
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{dueInfo.text}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { formatDueDate } from '@/lib/dateUtils';
import {
  CheckCircle2,
  Circle,
  Search,
  Clock,
  UserCheck,
} from 'lucide-react';

export function WorkScreen() {
  const {
    hubState,
    createTask,
    setSelectedTask,
    toggleTaskStatus,
  } = useHub();
  const { t, language } = useI18n();

  const [filterTab, setFilterTab] = useState<'my' | 'team' | 'done'>('my');
  const [quickTitle, setQuickTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!hubState) return null;

  const currentUserId = hubState.currentUser.id;

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await createTask({
      title: quickTitle.trim(),
      assignee_id: currentUserId,
      priority: 'medium',
      status: 'todo',
    });
    setQuickTitle('');
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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.work.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-0.5">
            {language === 'vi'
              ? 'Quản lý công việc cá nhân & phân công cho Team'
              : 'Manage tasks and assignments'}
          </p>
        </div>
      </div>

      {/* 1-Line Quick Task Add Bar */}
      <form onSubmit={handleQuickSubmit} className="relative">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder={language === 'vi' ? '+ Thêm việc mới rồi bấm Enter...' : '+ Add a new task and press Enter...'}
          className="w-full pl-4 pr-24 py-3.5 text-sm sm:text-base font-bold rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
        {quickTitle.trim() && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-xl active:scale-95 shadow-xs transition"
          >
            {isSubmitting ? '...' : t.common.save}
          </button>
        )}
      </form>

      {/* Simple 3-Tab Filter Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setFilterTab('my')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'my'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'vi' ? 'Của tôi' : 'My Work'}
          </button>
          <button
            onClick={() => setFilterTab('team')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'team'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'vi' ? 'Của Team' : 'Team Work'}
          </button>
          <button
            onClick={() => setFilterTab('done')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'done'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'vi' ? 'Đã xong' : 'Done'}
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
          <div className="py-14 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-2">
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
              {filterTab === 'done'
                ? (language === 'vi' ? 'Chưa có công việc nào hoàn thành.' : 'No completed tasks.')
                : (language === 'vi' ? 'Không có việc nào cần làm. Nhập ở trên để thêm việc mới!' : 'No tasks here. Type above to add one!')}
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
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white shrink-0">
                        {t.statusLabels.urgent}
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2.5 flex-wrap mt-1.5 text-xs text-zinc-400">
                    {task.project_name && (
                      <span
                        className="px-2 py-0.5 rounded-md font-bold text-xs"
                        style={{
                          backgroundColor: `${task.project_color || '#3b82f6'}18`,
                          color: task.project_color || '#3b82f6',
                        }}
                      >
                        {task.project_name}
                      </span>
                    )}

                    {assignmentContext && (
                      <span className="flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
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

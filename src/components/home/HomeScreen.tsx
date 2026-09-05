'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { formatRelativeTime, formatDueDate } from '@/lib/dateUtils';
import {
  Circle,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';

export function HomeScreen() {
  const {
    hubState,
    setSelectedTask,
    toggleTaskStatus,
    openQuickAction,
    setActiveTab,
  } = useHub();
  const { t, language } = useI18n();

  if (!hubState) return null;

  const { currentUser, attention, recentActivities } = hubState;
  const actionItems = attention.actionRequired;
  const activities = recentActivities.slice(0, 6);

  const currentHour = new Date().getHours();
  let greeting = t.home.goodMorning;
  if (currentHour >= 12 && currentHour < 18) {
    greeting = t.home.goodAfternoon;
  } else if (currentHour >= 18 || currentHour < 5) {
    greeting = t.home.goodEvening;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-2xl mx-auto">
      {/* Top Banner / Greeting */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>{greeting}, {currentUser.name}</span>
            <span>👋</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-0.5">
            {language === 'vi'
              ? 'Tổng quan công việc & cập nhật nhóm hôm nay'
              : "Today's team focus & recent updates"}
          </p>
        </div>

        <button
          onClick={() => openQuickAction('task')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.work.newTask}</span>
        </button>
      </div>

      {/* 1. Needs Your Attention (Action Required) */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {t.home.needsYourAction}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold">
              {actionItems.length}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('work')}
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>{t.common.viewAllWork}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {actionItems.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {t.home.allCaughtUpTitle}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.home.noActionTasks}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {actionItems.slice(0, 5).map(({ task }) => {
              const dueInfo = formatDueDate(task.due_date);
              const isUrgent = task.priority === 'urgent';
              const assignContext = task.creator_id !== currentUser.id
                ? `${task.creator_name || 'Team'} → ${currentUser.name}`
                : `${currentUser.name}`;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition cursor-pointer hover:shadow-sm ${
                    isUrgent
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                      : 'bg-zinc-50/80 dark:bg-zinc-800/50 border-zinc-200/80 dark:border-zinc-800'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task);
                    }}
                    className="mt-0.5 text-zinc-400 hover:text-emerald-500 transition"
                  >
                    <Circle className="w-5 h-5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                      {task.project_name && (
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {task.project_name}
                        </span>
                      )}
                      {task.project_name && <span>•</span>}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {assignContext}
                      </span>
                      {task.due_date && (
                        <>
                          <span>•</span>
                          <span className={`font-semibold ${dueInfo.isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                            {dueInfo.text}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Recent Updates */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{t.home.recentActivity}</span>
          </h2>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-xs sm:text-sm text-zinc-400">
              {t.feed.noActivities}
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                onClick={() => {
                  if (act.entity_type === 'task') {
                    const task = hubState.tasks.find((t) => t.id === act.entity_id);
                    if (task) setSelectedTask(task);
                  }
                }}
                className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition cursor-pointer"
              >
                <span className="text-lg mt-0.5">{act.actor_avatar || '👤'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {act.summary}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                    {act.project_name && (
                      <span className="font-bold text-zinc-600 dark:text-zinc-400">
                        {act.project_name} •
                      </span>
                    )}
                    <span>{formatRelativeTime(act.created_at)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

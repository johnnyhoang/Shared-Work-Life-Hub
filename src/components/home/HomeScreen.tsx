'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { formatRelativeTime, formatDueDate } from '@/lib/dateUtils';
import {
  CheckCircle2,
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
    <div className="space-y-5 pb-20 md:pb-8 max-w-2xl mx-auto">
      {/* Top Banner / Greeting */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            <span>{greeting}, {currentUser.name}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {language === 'vi'
              ? 'Tổng quan công việc & cập nhật nhóm hôm nay'
              : "Today's team focus & recent updates"}
          </p>
        </div>

        <button
          onClick={() => openQuickAction('task')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.work.newTask}</span>
        </button>
      </div>

      {/* 1. Needs Your Attention (Action Required) */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {t.home.needsYourAction}
            </h2>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-black">
              {actionItems.length}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('work')}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            <span>{t.common.viewAllWork}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {actionItems.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t.home.allCaughtUpTitle}
            </p>
            <p className="text-[11px] text-zinc-400">
              {t.home.noActionTasks}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {actionItems.slice(0, 5).map(({ task, reason }) => {
              const dueInfo = formatDueDate(task.due_date);
              const isUrgent = task.priority === 'urgent';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer hover:shadow-xs ${
                    isUrgent
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task);
                    }}
                    className="mt-0.5 text-zinc-400 hover:text-emerald-500 transition"
                  >
                    <Circle className="w-4 h-4" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                      {task.project_name && (
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {task.project_name}
                        </span>
                      )}
                      <span>•</span>
                      <span>{reason}</span>
                      {task.due_date && (
                        <>
                          <span>•</span>
                          <span className={dueInfo.isOverdue ? 'text-rose-600 font-bold' : ''}>
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

      {/* 2. Recent Updates (What Changed) */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.home.recentActivity}</span>
          </h2>
        </div>

        <div className="space-y-2">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400">
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
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition cursor-pointer"
              >
                <span className="text-base mt-0.5">{act.actor_avatar || '👤'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {act.summary}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                    {act.project_name && (
                      <span className="font-semibold text-zinc-600 dark:text-zinc-400">
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

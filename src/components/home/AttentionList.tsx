'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { formatDueDate } from '@/lib/dateUtils';
import { Circle, ArrowRight, Clock } from 'lucide-react';

export function AttentionList() {
  const { hubState, setSelectedTask, toggleTaskStatus, setActiveTab } = useHub();
  const { t } = useI18n();

  if (!hubState) return null;

  const { actionRequired, waiting } = hubState.attention;

  return (
    <div className="space-y-4">
      {/* 1. Needs Your Action */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>{t.home.needsYourAction}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                {actionRequired.length}
              </span>
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('work')}
            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            <span>{t.common.viewAllWork}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {actionRequired.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {t.home.noActionTasks}
          </div>
        ) : (
          <div className="space-y-2">
            {actionRequired.map(({ task, reason, severity }) => {
              const dueInfo = formatDueDate(task.due_date);
              const isUrgent = severity === 'urgent' || task.priority === 'urgent';
              const isHigh = severity === 'high' || task.priority === 'high';

              return (
                <div
                  key={task.id}
                  className={`group flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    isUrgent
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/40 hover:border-rose-300'
                      : isHigh
                      ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-800/40 hover:border-amber-300'
                      : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-700/60 hover:border-zinc-300'
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  {/* Quick Toggle Done */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task);
                    }}
                    className="mt-0.5 text-zinc-400 hover:text-emerald-500 dark:text-zinc-500 dark:hover:text-emerald-400 transition"
                    title="Mark task done"
                  >
                    <Circle className="w-4 h-4" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
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

                      <span className="text-zinc-500 dark:text-zinc-400">
                        {reason}
                      </span>

                      {task.due_date && (
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            dueInfo.isOverdue
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
                    </div>
                  </div>

                  {isUrgent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0">
                      {t.statusLabels.urgent}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Waiting on Team */}
      {waiting.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>{t.home.waitingOnTeam}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                  {waiting.length}
                </span>
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {waiting.map(({ task, reason }) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {task.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                    {task.project_name && (
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {task.project_name}
                      </span>
                    )}
                    <span>•</span>
                    <span>{reason}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 uppercase tracking-wide shrink-0">
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

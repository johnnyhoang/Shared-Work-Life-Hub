'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Bell, Check, Sparkles } from 'lucide-react';

export function SinceLastVisitCard() {
  const { hubState, markVisited, setSelectedTask } = useHub();
  const { t } = useI18n();

  if (!hubState) return null;

  const { sinceLastVisit } = hubState;
  const changes = sinceLastVisit.changes;

  if (changes.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/40 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t.home.allCaughtUpTitle}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {t.home.allCaughtUpDesc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-sky-50/80 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-sky-950/30 border border-blue-200/80 dark:border-blue-800/40 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                {t.home.sinceLastVisit}
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {changes.length} {changes.length === 1 ? t.home.change : t.home.changes}
              </span>
            </div>
            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
              {t.home.whatChangedDesc}
            </div>
          </div>
        </div>

        {/* Mark caught up button */}
        <button
          onClick={markVisited}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 border border-blue-200 dark:border-blue-700 rounded-lg shadow-xs transition active:scale-95"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{t.home.caughtUp}</span>
        </button>
      </div>

      {/* Changes list */}
      <div className="space-y-2 mt-2">
        {changes.slice(0, 4).map((activity) => (
          <div
            key={activity.id}
            onClick={() => {
              if (activity.entity_type === 'task') {
                const task = hubState.tasks.find((t) => t.id === activity.entity_id);
                if (task) setSelectedTask(task);
              }
            }}
            className="flex items-start gap-2.5 p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-blue-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 transition cursor-pointer"
          >
            <span className="text-base mt-0.5">{activity.actor_avatar || '👤'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {activity.summary}
              </div>
              {activity.details && (
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {activity.details}
                </div>
              )}
            </div>
            <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0">
              {formatRelativeTime(activity.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

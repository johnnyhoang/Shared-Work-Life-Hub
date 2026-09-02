'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { CheckCircle2, PlusCircle, Lightbulb, FolderKanban, Scale } from 'lucide-react';

export function WeeklySummaryCard() {
  const { hubState } = useHub();

  if (!hubState) return null;

  const { weeklyStats } = hubState;

  const stats = [
    {
      label: 'Tasks Done',
      value: weeklyStats.tasks_completed,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Created',
      value: weeklyStats.tasks_created,
      icon: PlusCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Ideas',
      value: weeklyStats.ideas_added,
      icon: Lightbulb,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'Projects',
      value: weeklyStats.project_updates,
      icon: FolderKanban,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
      label: 'Decisions',
      value: weeklyStats.decisions_made,
      icon: Scale,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          This Week Summary
        </h3>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Last 7 days
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl ${item.bg} border border-transparent transition text-center`}
            >
              <Icon className={`w-4 h-4 mb-1 ${item.color}`} />
              <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {item.value}
              </div>
              <div className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-full">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

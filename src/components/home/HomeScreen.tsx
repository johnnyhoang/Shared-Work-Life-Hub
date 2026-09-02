'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { SinceLastVisitCard } from './SinceLastVisitCard';
import { AttentionList } from './AttentionList';
import { WeeklySummaryCard } from './WeeklySummaryCard';
import { RecentActivitySection } from './RecentActivitySection';
import { CheckSquare, Lightbulb } from 'lucide-react';

export function HomeScreen() {
  const { hubState, openQuickAction } = useHub();
  const { t } = useI18n();

  if (!hubState) return null;

  const { currentUser } = hubState;

  const currentHour = new Date().getHours();
  let greeting = t.home.goodMorning;
  if (currentHour >= 12 && currentHour < 18) {
    greeting = t.home.goodAfternoon;
  } else if (currentHour >= 18 || currentHour < 5) {
    greeting = t.home.goodEvening;
  }

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Top Greeting */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>{greeting}, {currentUser.name}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t.home.teamOverview}
          </p>
        </div>

        {/* Quick entry for desktop */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => openQuickAction('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.home.quickTask}</span>
          </button>
          <button
            onClick={() => openQuickAction('idea')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.home.quickIdea}</span>
          </button>
        </div>
      </div>

      {/* 1. Since You Last Visited */}
      <SinceLastVisitCard />

      {/* 2. My Attention (Action Required & Waiting) */}
      <AttentionList />

      {/* 3. This Week Summary Grid */}
      <WeeklySummaryCard />

      {/* 4. Recent Activity Log */}
      <RecentActivitySection />
    </div>
  );
}

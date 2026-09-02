'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { SinceLastVisitCard } from './SinceLastVisitCard';
import { AttentionList } from './AttentionList';
import { WeeklySummaryCard } from './WeeklySummaryCard';
import { RecentActivitySection } from './RecentActivitySection';
import { Plus, CheckSquare, Lightbulb, Scale, BookOpen } from 'lucide-react';

export function HomeScreen() {
  const { hubState, openQuickAction } = useHub();

  if (!hubState) return null;

  const { currentUser, partnerUser } = hubState;

  // Determine greeting based on current local hour
  const currentHour = new Date().getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 18) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 18 || currentHour < 5) {
    greeting = 'Good evening';
  }

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Top Greeting & Quick Summary */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>{greeting}, {currentUser.name}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Collaborating with <strong className="text-zinc-700 dark:text-zinc-300">{partnerUser.name}</strong> ({partnerUser.location})
          </p>
        </div>

        {/* Floating Quick Entry for Desktop / Header */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => openQuickAction('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Task</span>
          </button>
          <button
            onClick={() => openQuickAction('idea')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Idea</span>
          </button>
        </div>
      </div>

      {/* 1. Since You Last Visited Banner */}
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

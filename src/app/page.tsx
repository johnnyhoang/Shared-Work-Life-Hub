'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { HomeScreen } from '@/components/home/HomeScreen';
import { WorkScreen } from '@/components/work/WorkScreen';
import { ProjectsScreen } from '@/components/projects/ProjectsScreen';
import { ActivityFeedScreen } from '@/components/feed/ActivityFeedScreen';
import { MoreScreen } from '@/components/more/MoreScreen';
import { TaskDetailModal } from '@/components/work/TaskDetailModal';
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal';
import { QuickActionModal } from '@/components/common/QuickActionModal';
import { CreateWorkspaceModal } from '@/components/common/CreateWorkspaceModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [mounted, setMounted] = useState(false);
  const { hubState, isLoading, activeTab } = useHub();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (isLoading && !hubState)) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4"
      >
        <div suppressHydrationWarning className="flex flex-col items-center gap-3">
          <div
            suppressHydrationWarning
            className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-pulse"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <p
            suppressHydrationWarning
            className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
          >
            Hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex flex-col bg-zinc-50/40 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
    >
      <Header />

      {/* Main Layout Container */}
      <div
        suppressHydrationWarning
        className="flex-1 flex w-full md:pl-60"
      >
        <BottomNav />

        {/* Content Area */}
        <main
          suppressHydrationWarning
          className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 overflow-x-hidden"
        >
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'work' && <WorkScreen />}
          {activeTab === 'projects' && <ProjectsScreen />}
          {activeTab === 'feed' && <ActivityFeedScreen />}
          {activeTab === 'more' && <MoreScreen />}
        </main>
      </div>


      {/* Modals & Drawers */}
      <TaskDetailModal />
      <ProjectDetailModal />
      <QuickActionModal />
      <CreateWorkspaceModal />
    </div>
  );
}

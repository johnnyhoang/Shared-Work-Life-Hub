'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import {
  Home,
  CheckSquare,
  FolderKanban,
  Activity as ActivityIcon,
  MoreHorizontal,
  Lightbulb,
  BookOpen,
  Scale,
} from 'lucide-react';

export function BottomNav() {
  const { activeTab, setActiveTab, hubState } = useHub();

  const attentionCount = hubState?.attention?.actionRequired?.length || 0;
  const sinceCount = hubState?.sinceLastVisit?.total_changes || 0;

  const navItems = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
      badge: sinceCount > 0 ? sinceCount : undefined,
      badgeColor: 'bg-blue-600',
    },
    {
      id: 'work' as const,
      label: 'Work',
      icon: CheckSquare,
      badge: attentionCount > 0 ? attentionCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'projects' as const,
      label: 'Projects',
      icon: FolderKanban,
    },
    {
      id: 'feed' as const,
      label: 'Feed',
      icon: ActivityIcon,
    },
    {
      id: 'more' as const,
      label: 'More',
      icon: MoreHorizontal,
    },
  ];

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 safe-area-pb">
        <div className="flex items-center justify-around h-14 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center w-full h-full py-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-0.5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 text-[9px] font-bold text-white rounded-full flex items-center justify-center ${item.badgeColor}`}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar (Rendered on md screens) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-12 bottom-0 w-56 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-4 z-20">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Links in sidebar for Ideas, Knowledge, Decisions */}
        <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Quick Modules
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('more')}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Ideas Pipeline</span>
            </button>
            <button
              onClick={() => setActiveTab('more')}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Knowledge Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('more')}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
            >
              <Scale className="w-3.5 h-3.5 text-purple-500" />
              <span>Decisions Log</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

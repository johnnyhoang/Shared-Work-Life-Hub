'use client';

import React from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import {
  Home,
  CheckSquare,
  FolderKanban,
} from 'lucide-react';

export function BottomNav() {
  const { activeTab, setActiveTab, hubState } = useHub();
  const { t, language } = useI18n();

  const attentionCount = hubState?.attention?.actionRequired?.length || 0;

  const navItems = [
    {
      id: 'home' as const,
      label: t.common.home,
      icon: Home,
    },
    {
      id: 'work' as const,
      label: t.common.work,
      icon: CheckSquare,
      badge: attentionCount > 0 ? attentionCount : undefined,
    },
    {
      id: 'projects' as const,
      label: language === 'vi' ? 'Không gian chung' : 'Hub Space',
      icon: FolderKanban,
    },
  ];

  return (
    <>
      {/* Mobile Bottom Bar - Clean 3 Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 shadow-lg">
        <div className="flex items-center justify-around h-14 max-w-md mx-auto px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-0.5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 text-[9px] font-black text-white rounded-full flex items-center justify-center bg-rose-500">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar (Rendered on md screens) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-12 bottom-0 w-52 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-3 z-20">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
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
      </aside>
    </>
  );
}

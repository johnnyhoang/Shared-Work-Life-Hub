'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { TeamManagementModal } from '../team/TeamManagementModal';
import { NotificationSettingsModal } from '../more/NotificationSettingsModal';
import { UserAvatar } from '../common/UserAvatar';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import {
  Plus,
  ShieldCheck,
  Globe,
  LogOut,
  LogIn,
  ChevronDown,
  Users,
  Bell,
  MoreHorizontal,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

export function Header() {
  const { hubState, openQuickAction, setActiveTab } = useHub();
  const { t, language, setLanguage } = useI18n();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!hubState) return null;

  const currentUser = hubState.currentUser;
  const isLead = currentUser.role === 'admin';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
        <div className="px-4 h-[var(--header-h)] flex items-center justify-between gap-3">
          {/* Left: Brand & Workspace Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 font-bold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Hub</span>
            </div>

            <WorkspaceSwitcher />
          </div>

          {/* Right: Language + Add Button + Profile */}
          <div className="flex items-center gap-2">
            {/* 1-Tap Language */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-2.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1.5"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4 text-blue-500" />
              <span>{language === 'vi' ? 'VI' : 'EN'}</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={() => openQuickAction('task')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">{t.common.quickAdd}</span>
            </button>

            {/* User Profile */}
            {authUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200"
                >
                  <UserAvatar
                    avatar={currentUser.avatar_url || currentUser.avatar}
                    name={currentUser.name}
                    size="md"
                  />
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                  {isLead && <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />}
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                        <UserAvatar
                          avatar={currentUser.avatar_url || currentUser.avatar}
                          name={currentUser.name}
                          size="lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-sm">
                            {currentUser.name}
                          </div>
                          <div className="text-xs text-zinc-400 truncate">
                            {currentUser.email}
                          </div>
                        </div>
                      </div>

                      <div className="p-1 border-b border-zinc-100 dark:border-zinc-800 space-y-0.5">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsNotificationModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold"
                        >
                          <Bell className="w-4 h-4 text-blue-600" />
                          <span>{t.notifications.title}</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setActiveTab('more');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold"
                        >
                          <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                          <span>{t.common.more}</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsTeamModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold"
                        >
                          <Users className="w-4 h-4 text-purple-600" />
                          <span>{t.common.teamManagement}</span>
                        </button>
                      </div>

                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t.common.logout}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-xl hover:bg-blue-100 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.common.login}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </>
  );
}


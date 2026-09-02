'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { getLocalTimeInTimezone } from '@/lib/dateUtils';
import { TeamManagementModal } from '../team/TeamManagementModal';
import {
  Plus,
  ShieldCheck,
  Globe,
  LogOut,
  LogIn,
  ChevronDown,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

export function Header() {
  const { hubState, openQuickAction } = useHub();
  const { t, language, setLanguage } = useI18n();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
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
  const partnerUser = hubState.partnerUser;
  const isLead = currentUser.role === 'admin';

  const userTime = getLocalTimeInTimezone(currentUser.timezone);
  const partnerTime = getLocalTimeInTimezone(partnerUser.timezone);

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
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Left: Brand & Clocks */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-black text-sm tracking-tight text-zinc-900 dark:text-zinc-50">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hub</span>
            </div>

            {/* Compact Timezone */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-lg">
              <span>{currentUser.flag} {userTime.time}</span>
              {partnerUser.id !== currentUser.id && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600">•</span>
                  <span>{partnerUser.flag} {partnerTime.time}</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Language + Add Button + Profile */}
          <div className="flex items-center gap-1.5">
            {/* 1-Tap Language */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-2 py-1 text-[11px] font-bold rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1"
              title="Toggle Language"
            >
              <Globe className="w-3 h-3 text-blue-500" />
              <span>{language === 'vi' ? 'VI' : 'EN'}</span>
            </button>

            {/* Quick Add FAB */}
            <button
              onClick={() => openQuickAction('task')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t.common.quickAdd}</span>
            </button>

            {/* User Dropdown / Login */}
            {authUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <span className="text-sm">{currentUser.avatar || '👤'}</span>
                  <span className="max-w-[70px] truncate">{currentUser.name}</span>
                  {isLead && <ShieldCheck className="w-3 h-3 text-blue-600" />}
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 text-xs">
                      <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">
                          {currentUser.email}
                        </div>
                      </div>

                      <div className="p-1 border-b border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsTeamModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                        >
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>{t.common.teamManagement}</span>
                        </button>
                      </div>

                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
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
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
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
    </>
  );
}

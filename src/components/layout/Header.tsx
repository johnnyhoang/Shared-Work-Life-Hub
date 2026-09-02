'use client';

import React, { useState, useEffect } from 'react';
import { useHub } from '@/context/HubContext';
import { useI18n } from '@/lib/i18n';
import { getLocalTimeInTimezone } from '@/lib/dateUtils';
import { TeamManagementModal } from '../team/TeamManagementModal';
import {
  Clock,
  Moon,
  Sun,
  Users,
  Plus,
  ShieldCheck,
  User,
  Globe,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const { hubState, activeUserId, switchUser, openQuickAction } = useHub();
  const { t, language, setLanguage } = useI18n();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

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
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Brand & Timezone Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
                {t.common.hub}
              </span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-zinc-300 dark:bg-zinc-700" />

            {/* Timezone Clocks */}
            <div className="flex items-center gap-2 text-xs">
              {/* Active User Time */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                <span>{currentUser.flag}</span>
                <span className="max-w-[70px] truncate">{currentUser.name}</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {userTime.time} {userTime.period}
                </span>
                {userTime.isNight ? (
                  <Moon className="w-3 h-3 text-indigo-400" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-500" />
                )}
              </div>

              {/* Partner/Team Time */}
              {partnerUser.id !== currentUser.id && (
                <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  <span>{partnerUser.flag}</span>
                  <span className="max-w-[70px] truncate">{partnerUser.name}</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {partnerTime.time} {partnerTime.period}
                  </span>
                  {partnerTime.isNight ? (
                    <Moon className="w-3 h-3 text-indigo-400" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Language Switcher + Quick Add + User / Role */}
          <div className="flex items-center gap-2">
            {/* Language Switcher 1-Tap */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
              title="Toggle English / Tiếng Việt"
            >
              <Globe className="w-3 h-3 text-blue-500" />
              <span>{language === 'vi' ? 'VI' : 'EN'}</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={() => openQuickAction('task')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-full shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.common.quickAdd}</span>
            </button>

            {/* Active User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition"
              >
                <span className="text-sm">{currentUser.avatar || '👤'}</span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[80px] truncate">
                  {currentUser.name}
                </span>
                {isLead && (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 text-xs">
                    {/* User profile header */}
                    <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{currentUser.name}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            isLead
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {isLead ? t.team.roleLead : t.team.roleMember}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {currentUser.email}
                      </div>
                    </div>

                    {/* Team management button */}
                    <div className="p-1 border-b border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setIsTeamModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium transition"
                      >
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>{t.common.teamManagement}</span>
                      </button>
                    </div>

                    {/* Member Switcher (for dev/testing) */}
                    <div className="p-1 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        {language === 'vi' ? 'Chuyển góc nhìn thành viên' : 'Switch Member View'}
                      </div>
                      {hubState.users.map((u) => {
                        const isSelected = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{u.avatar || '👤'}</span>
                              <span>{u.name}</span>
                            </span>
                            {u.role === 'admin' && (
                              <span className="text-[9px] font-bold text-blue-500">Lead</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sign out */}
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.common.logout}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Team Management Modal */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </>
  );
}
